"""Build an allowlisted Chrome Web Store upload ZIP; no private previews or logs."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
source = root / "extension"
manifest = json.loads((source / "manifest.json").read_text(encoding="utf-8"))
files = {"manifest.json", "popup.html", "popup.css", "popup.js", "privacy.html", "README.md"}
for script in manifest["content_scripts"]:
    files.update(script["js"])
    files.update(script["css"])
files.update(manifest["icons"].values())
files.update(manifest["action"]["default_icon"].values())
output = root / "dist" / f"paperplane-{manifest['version']}.zip"
output.parent.mkdir(exist_ok=True)
for name in files:
    assert (source / name).resolve().is_relative_to(source.resolve()), name
    assert (source / name).is_file(), name
with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    for name in sorted(files):
        archive.writestr(name, (source / name).read_bytes())
with ZipFile(output) as archive:
    assert set(archive.namelist()) == files
    for name in files:
        assert archive.read(name) == (source / name).read_bytes()
print(f"Verified {len(files)} files: {output.name}")
print("SHA256 " + hashlib.sha256(output.read_bytes()).hexdigest())
