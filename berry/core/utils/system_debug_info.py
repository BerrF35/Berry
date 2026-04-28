import platform
import subprocess

from importlib.metadata import version, PackageNotFoundError
from importlib.metadata import distributions
import psutil
import toml


def get_python_version():
    return platform.python_version()


def get_pip_version():
    try:
        pip_version = subprocess.check_output(["pip", "--version"]).decode().split()[1]
    except Exception as e:
        pip_version = str(e)
    return pip_version


def get_berry_version():
    try:
        berry_version_cmd = subprocess.check_output(
            ["berry", "--version"], text=True
        )
    except Exception as e:
        berry_version_cmd = str(e)
    try:
        pkg_ver = version("berry")
    except PackageNotFoundError:
        pkg_ver = None
    berry_version = berry_version_cmd, pkg_ver
    return berry_version


def get_os_version():
    return platform.platform()


def get_cpu_info():
    return platform.processor()


def get_ram_info():
    vm = psutil.virtual_memory()
    used_ram_gb = vm.used / (1024**3)
    free_ram_gb = vm.free / (1024**3)
    total_ram_gb = vm.total / (1024**3)
    return f"{total_ram_gb:.2f} GB, used: {used_ram_gb:.2f}, free: {free_ram_gb:.2f}"


def get_package_mismatches(file_path="pyproject.toml"):
    with open(file_path, "r") as file:
        pyproject = toml.load(file)
    dependencies = pyproject["tool"]["poetry"]["dependencies"]
    dev_dependencies = pyproject["tool"]["poetry"]["group"]["dev"]["dependencies"]
    dependencies.update(dev_dependencies)

    installed_packages = {
        dist.metadata["Name"].lower(): dist.version
        for dist in distributions()
    }
    mismatches = []
    for package, version_info in dependencies.items():
        if isinstance(version_info, dict):
            version_info = version_info["version"]
        installed_version = installed_packages.get(package)
        if installed_version and version_info.startswith("^"):
            expected_version = version_info[1:]
            if not installed_version.startswith(expected_version):
                mismatches.append(
                    f"\t  {package}: Mismatch, pyproject.toml={expected_version}, pip={installed_version}"
                )
        else:
            mismatches.append(f"\t  {package}: Not found in pip list")

    return "\n" + "\n".join(mismatches)


def berry_info(berry):
    try:
        if berry.offline and berry.llm.api_base:
            try:
                curl = subprocess.check_output(f"curl {berry.llm.api_base}")
            except Exception as e:
                curl = str(e)
        else:
            curl = "Not local"

        messages_to_display = []
        for message in berry.messages:
            message = str(message.copy())
            try:
                if len(message) > 2000:
                    message = message[:1000]
            except Exception as e:
                print(str(e), "for message:", message)
            messages_to_display.append(message)

        return f"""

        # berry Info
        
        Vision: {berry.llm.supports_vision}
        Model: {berry.llm.model}
        Function calling: {berry.llm.supports_functions}
        Context window: {berry.llm.context_window}
        Max tokens: {berry.llm.max_tokens}
        Computer API: {berry.computer.import_computer_api}

        Auto run: {berry.auto_run}
        API base: {berry.llm.api_base}
        Offline: {berry.offline}

        Curl output: {curl}

        # Messages

        System Message: {berry.system_message}

        """ + "\n\n".join(
            [str(m) for m in messages_to_display]
        )
    except:
        return "Error, couldn't get berry info"


def system_info(berry):
    berry_version = get_berry_version()
    print(
        f"""
        Python Version: {get_python_version()}
        Pip Version: {get_pip_version()}
        berry Version: cmd: {berry_version[0]}, pkg: {berry_version[1]}
        OS Version and Architecture: {get_os_version()}
        CPU Info: {get_cpu_info()}
        RAM Info: {get_ram_info()}
        {berry_info(berry)}
    """
    )

    # Removed the following, as it causes `FileNotFoundError: [Errno 2] No such file or directory: 'pyproject.toml'`` on prod
    # (i think it works on dev, but on prod the pyproject.toml will not be in the cwd. might not be accessible at all)
    # Package Version Mismatches:
    # {get_package_mismatches()}



