#!/usr/bin/env python3
"""生成 xtai-nav.cn 占位自签名证书，输出到项目 ssl/ 目录。"""
from datetime import datetime, timedelta, timezone
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID

OUT = Path(__file__).resolve().parent.parent / "ssl"
OUT.mkdir(parents=True, exist_ok=True)

key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "xtai-nav.cn")])
now = datetime.now(timezone.utc)
cert = (
    x509.CertificateBuilder()
    .subject_name(name)
    .issuer_name(name)
    .public_key(key.public_key())
    .serial_number(x509.random_serial_number())
    .not_valid_before(now)
    .not_valid_after(now + timedelta(days=3650))
    .sign(key, hashes.SHA256())
)

OUT.joinpath("xtai-nav.cn.key").write_bytes(
    key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
)
OUT.joinpath("xtai-nav.cn.pem").write_bytes(cert.public_bytes(serialization.Encoding.PEM))
print(f"已写入占位证书: {OUT}")
