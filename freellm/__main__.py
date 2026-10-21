import sys

from .client import ask


def main() -> None:
    prompt = " ".join(sys.argv[1:]) or "Скажи «ку-ку»"
    print(ask(prompt))


if __name__ == "__main__":
    main()
