"""Renderiza a fórmula §7.9 revisada como PNG transparente em alta resolução
para embutir no slide crítico da apresentação."""

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import rc

OUT_DIR = Path(r"C:\Users\DETRAN\Documents\GitHub\web_simulator\scripts")
OUT = OUT_DIR / "formula.png"
OUT2 = OUT_DIR / "formula_argmax.png"

# Usamos mathtext do matplotlib (sem depender de LaTeX instalado)
rc("mathtext", fontset="cm")  # Computer Modern — boa qualidade


def render(formula: str, out: Path, width: float, height: float) -> None:
    fig = plt.figure(figsize=(width, height), dpi=300)
    fig.patch.set_alpha(0)  # fundo transparente
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis("off")
    ax.text(
        0.5,
        0.5,
        formula,
        fontsize=24,
        ha="center",
        va="center",
        color="#0F172A",
    )
    fig.savefig(out, dpi=300, transparent=True, bbox_inches="tight", pad_inches=0.1)
    plt.close(fig)


# Fórmula principal
render(
    r"$A_j \;=\; \sum_{i}\, \alpha_i \, a_{j,i}\, X_i "
    r"\;+\; \sum_{k}\, \beta_k \, a_{j,k}\, H_k "
    r"\;-\; \gamma \, c_j \, \widetilde{\chi}$",
    OUT,
    width=11,
    height=2,
)

# Segunda linha (argmax)
render(
    r"$m^{\ast} \;=\; \arg\max_{j \in M}\, A_j$",
    OUT2,
    width=7,
    height=1.4,
)

print("Gerado:", OUT)
print("Gerado:", OUT2)
