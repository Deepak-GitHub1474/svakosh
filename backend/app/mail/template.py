from __future__ import annotations

from collections.abc import Sequence
from html import escape
from typing import Literal

BlockKind = Literal["text", "code", "note"]
Block = tuple[BlockKind, str]

FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
MONO = "'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace"

LIGHT = {
    "page": "#f2f3f5",
    "card": "#ffffff",
    "border": "#e3e5e9",
    "heading": "#0d0f12",
    "body": "#3f454e",
    "muted": "#767d88",
    "accent": "#8a6d11",
    "code_bg": "#f5f6f8",
    "code_border": "#e3e5e9",
    "code_text": "#0d0f12",
}

DARK = {
    "page": "#08090a",
    "card": "#14161a",
    "border": "#262a31",
    "heading": "#f1f5f9",
    "body": "#cbd5e1",
    "muted": "#94a3b8",
    "accent": "#d4af37",
    "code_bg": "#1c1f24",
    "code_border": "#333a43",
    "code_text": "#f1f5f9",
}

DARK_RULES = (
    (".sk-page", "background-color:{page} !important;"),
    (".sk-card", "background-color:{card} !important;border-color:{border} !important;"),
    (".sk-heading", "color:{heading} !important;"),
    (".sk-text", "color:{body} !important;"),
    (".sk-muted", "color:{muted} !important;"),
    (".sk-accent", "color:{accent} !important;"),
    (".sk-code", "background-color:{code_bg} !important;border-color:{code_border} !important;color:{code_text} !important;"),
    (".sk-rule", "background-color:{border} !important;"),
)

SHELL = (
    '<!doctype html><html lang="en"><head>'
    '<meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1">'
    '<meta name="color-scheme" content="light dark">'
    '<meta name="supported-color-schemes" content="light dark">'
    "<title>{title}</title>{styles}</head>"
    '<body class="sk-page" style="margin:0;padding:0;width:100%;background-color:{page};">{preheader}'
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"'
    ' class="sk-page" style="width:100%;background-color:{page};">'
    '<tr><td align="center" style="padding:32px 12px;">'
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"'
    ' class="sk-card" style="width:100%;max-width:560px;background-color:{card};'
    'border:1px solid {border};border-radius:18px;">{rows}</table>'
    '<div class="sk-muted" style="max-width:560px;padding:16px 10px 0 10px;font-family:{font};'
    'font-size:11px;line-height:1.6;color:{muted};text-align:center;">Svakosh · Own Your Growth.</div>'
    "</td></tr></table></body></html>"
)


def _dark_block(prefix: str) -> str:
    return "".join(f"{prefix}{sel}{{{decl.format(**DARK)}}}" for sel, decl in DARK_RULES)


def _styles() -> str:
    return (
        "<style>"
        ":root{color-scheme:light dark;supported-color-schemes:light dark;}"
        "body{-webkit-text-size-adjust:100%;}"
        "img{border:0;line-height:100%;}"
        "@media only screen and (max-width:600px){"
        ".sk-pad{padding-left:22px !important;padding-right:22px !important;}"
        ".sk-heading{font-size:20px !important;}"
        ".sk-code{font-size:26px !important;letter-spacing:0.18em !important;text-indent:0.18em !important;}"
        "}"
        "@media (prefers-color-scheme:dark){" + _dark_block("") + "}"
        + _dark_block("[data-ogsc] ")
        + "</style>"
    )


def _preheader(value: str) -> str:
    return (
        '<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">'
        + escape(value)
        + "&#8203;" * 40
        + "</div>"
    )


def _header(heading: str) -> str:
    return (
        '<tr><td class="sk-pad" style="padding:36px 40px 0 40px;">'
        f'<div class="sk-accent" style="font-family:{FONT};font-size:12px;font-weight:700;'
        f'letter-spacing:0.34em;color:{LIGHT["accent"]};">SVAKOSH</div></td></tr>'
        '<tr><td class="sk-pad sk-heading" style="padding:18px 40px 16px 40px;'
        f'font-family:{FONT};font-size:22px;font-weight:600;line-height:1.35;'
        f'color:{LIGHT["heading"]};">{escape(heading)}</td></tr>'
    )


def _text_row(value: str) -> str:
    return (
        '<tr><td class="sk-pad sk-text" style="padding:0 40px 18px 40px;'
        f'font-family:{FONT};font-size:15px;line-height:1.75;color:{LIGHT["body"]};">'
        f"{escape(value)}</td></tr>"
    )


def _note_row(value: str) -> str:
    return (
        '<tr><td class="sk-pad sk-muted" style="padding:0 40px 18px 40px;'
        f'font-family:{FONT};font-size:13px;line-height:1.7;color:{LIGHT["muted"]};">'
        f"{escape(value)}</td></tr>"
    )


def _code_row(value: str) -> str:
    return (
        '<tr><td class="sk-pad" style="padding:4px 40px 24px 40px;">'
        f'<div class="sk-code" style="font-family:{MONO};font-size:34px;font-weight:600;'
        "letter-spacing:0.3em;text-indent:0.3em;text-align:center;padding:20px 10px;"
        f'border-radius:14px;background-color:{LIGHT["code_bg"]};'
        f'border:1px solid {LIGHT["code_border"]};color:{LIGHT["code_text"]};">'
        f"{escape(value)}</div></td></tr>"
    )


def _footer(value: str) -> str:
    return (
        '<tr><td class="sk-pad" style="padding:4px 40px 0 40px;">'
        f'<div class="sk-rule" style="height:1px;font-size:0;line-height:1px;'
        f'background-color:{LIGHT["border"]};">&nbsp;</div></td></tr>'
        '<tr><td class="sk-pad sk-muted" style="padding:18px 40px 32px 40px;'
        f'font-family:{FONT};font-size:12px;line-height:1.7;color:{LIGHT["muted"]};">'
        f"{escape(value)}</td></tr>"
    )


ROW_BUILDERS = {"text": _text_row, "code": _code_row, "note": _note_row}


def _plain(heading: str, blocks: Sequence[Block], footer: str) -> str:
    lines = [heading, ""]
    for kind, value in blocks:
        lines.append(f"    {value}" if kind == "code" else value)
        lines.append("")
    lines.append(footer)
    return "\n".join(lines).strip() + "\n"


def render(
    *, preheader: str, heading: str, blocks: Sequence[Block], footer: str
) -> tuple[str, str]:
    rows = _header(heading)
    rows += "".join(ROW_BUILDERS[kind](value) for kind, value in blocks)
    rows += _footer(footer)
    html = SHELL.format(
        title=escape(heading),
        styles=_styles(),
        preheader=_preheader(preheader),
        rows=rows,
        font=FONT,
        **LIGHT,
    )
    return _plain(heading, blocks, footer), html
