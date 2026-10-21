#!/usr/bin/env python3
"""Считает коэффициенты контраста WCAG 2.2 для пар токенов из tokens.css
и вписывает таблицу в index.html между маркерами <!-- contrast:start --> / <!-- contrast:end -->.

Запуск:  python3 design-system/contrast.py          (печать + обновление index.html)
         python3 design-system/contrast.py --check  (только проверка, код 1 при нарушении)
"""
import re, sys, pathlib

HERE = pathlib.Path(__file__).resolve().parent
CSS = (HERE / "tokens.css").read_text(encoding="utf-8")


def block(selector_regex):
    m = re.search(selector_regex + r"\s*\{(.*?)\n\s*\}", CSS, re.S)
    return dict(re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})", m.group(1)))


LIGHT = block(r":root,\s*\[data-theme=\"light\"\]")
DARK = block(r":root\[data-theme=\"dark\"\],\s*\[data-theme=\"dark\"\]")


def lum(h):
    h = h.lstrip("#")
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a, b):
    hi, lo = sorted([lum(a), lum(b)], reverse=True)
    return (hi + 0.05) / (lo + 0.05)


# (подпись, fg, bg, тип: text | large | ui | decor)
PAIRS = [
    ("Основной текст", "ink", "paper", "text"),
    ("Основной текст на камне", "ink", "stone", "text"),
    ("Вторичный текст", "muted", "paper", "text"),
    ("Вторичный текст на камне", "muted", "stone", "text"),
    ("Текст примечания", "ink", "blue-soft", "text"),
    ("Бордо: ссылки, цифры, буквица", "bordeaux", "paper", "text"),
    ("Бордо на камне", "bordeaux", "stone", "text"),
    ("Синий: даты, «стало», навигация", "blue", "paper", "text"),
    ("Синий на камне", "blue", "stone", "text"),
    ("Старое золото: кикер, мелкие подписи", "gold-text", "paper", "text"),
    ("Старое золото на камне", "gold-text", "stone", "text"),
    ("Золото: римские цифры ≥ 24px", "gold", "paper", "large"),
    ("Золото на камне", "gold", "stone", "large"),
    ("Золото мелким текстом", "gold", "paper", "text"),
    ("Текст кнопки на бордо", "on-accent", "bordeaux", "text"),
    ("Активный пункт переключателя", "paper", "blue", "text"),
    ("Тёмный раздел: текст", "on-night", "night", "text"),
    ("Тёмный раздел: вторичный", "on-night-muted", "night", "text"),
    ("Тёмный раздел: золото", "gold-on-night", "night", "text"),
    ("Границы элементов управления", "line-strong", "paper", "ui"),
    ("Кольцо фокуса", "focus", "paper", "ui"),
    ("Волосяная линия", "line", "paper", "decor"),
]


def verdict(r, kind):
    if kind == "decor":
        return ("декор", "info")
    if kind == "ui":
        return ("AA 1.4.11", "ok") if r >= 3 else ("< 3:1", "bad")
    if kind == "large":
        return ("AA крупный", "ok") if r >= 3 else ("запрещено", "bad")
    if r >= 7:
        return ("AAA", "ok")
    if r >= 4.5:
        return ("AA", "ok")
    if r >= 3:
        return ("только крупный", "warn")
    return ("запрещено", "bad")


def cell(theme, fg, bg, kind):
    f, b = theme[fg], theme[bg]
    r = ratio(f, b)
    label, cls = verdict(r, kind)
    return r, (f'<td><span class="ct-sample" style="background:{b}" aria-hidden="true"><i style="background:{f}"></i></span> '
               f'<b>{r:.2f}:1</b> <span class="ct-badge ct-badge--{cls}">{label}</span></td>')


def main():
    rows, failures = [], []
    for title, fg, bg, kind in PAIRS:
        rl, cl = cell(LIGHT, fg, bg, kind)
        rd, cd = cell(DARK, fg, bg, kind)
        rows.append(f'<tr><th scope="row">{title}<br><code>--{fg}</code> / <code>--{bg}</code></th>{cl}{cd}</tr>')
        print(f"{title:40s} light {rl:5.2f}  dark {rd:5.2f}")
        # Пары, которые мы ИСПОЛЬЗУЕМ, должны проходить; «запрещённые» показаны как предупреждение
        if (fg, bg, kind) not in {("gold", "stone", "large"), ("gold", "paper", "text")}:
            for th, r in (("light", rl), ("dark", rd)):
                need = {"text": 4.5, "large": 3, "ui": 3}.get(kind)
                if need and r < need:
                    failures.append(f"{title} [{th}] {r:.2f} < {need}")
    html = "\n".join(rows)
    if "--check" not in sys.argv:
        idx = HERE / "index.html"
        page = idx.read_text(encoding="utf-8")
        page = re.sub(r"(<!-- contrast:start -->).*?(<!-- contrast:end -->)",
                      lambda m: m.group(1) + "\n" + html + "\n" + m.group(2), page, flags=re.S)
        idx.write_text(page, encoding="utf-8")
    if failures:
        print("FAIL:\n" + "\n".join(failures))
        sys.exit(1)
    print("OK: все используемые пары проходят WCAG 2.2 AA")


if __name__ == "__main__":
    main()
