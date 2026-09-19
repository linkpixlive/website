import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoneyField } from "./MoneyField";

describe("MoneyField", () => {
  it("exibe o valor inicial mascarado em pt-BR", () => {
    render(
      <MoneyField label="Mensagem de texto" name="minTextAmount" defaultValue="10" />,
    );
    expect(screen.getByLabelText("Mensagem de texto")).toHaveValue("10,00");
    expect(
      document.querySelector('input[type="hidden"][name="minTextAmount"]'),
    ).toHaveAttribute("value", "10.00");
  });

  it("mascara a digitação e normaliza o hidden ponto-decimal", async () => {
    const user = userEvent.setup();
    render(<MoneyField label="Valor" name="minTextAmount" />);

    const input = screen.getByLabelText("Valor");
    await user.type(input, "100000");

    expect(input).toHaveValue("1.000,00");
    expect(
      document.querySelector('input[type="hidden"][name="minTextAmount"]'),
    ).toHaveAttribute("value", "1000.00");
  });

  it("envia hidden vazio quando o campo é apagado", async () => {
    const user = userEvent.setup();
    render(
      <MoneyField label="Valor" name="minTextAmount" defaultValue="5" />,
    );

    const input = screen.getByLabelText("Valor");
    await user.clear(input);

    expect(input).toHaveValue("");
    expect(
      document.querySelector('input[type="hidden"][name="minTextAmount"]'),
    ).toHaveAttribute("value", "");
  });

  it("chama onChange com (mascarado, centavos) a cada tecla", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MoneyField label="Valor" name="minTextAmount" onChange={onChange} />,
    );

    await user.type(screen.getByLabelText("Valor"), "1000");

    expect(onChange).toHaveBeenLastCalledWith("10,00", 1000);
  });

  it("chama onBlur ao sair do campo", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(
      <>
        <MoneyField label="Valor" name="minTextAmount" onBlur={onBlur} />
        <button type="button">fora</button>
      </>,
    );

    await user.click(screen.getByLabelText("Valor"));
    await user.click(screen.getByRole("button", { name: "fora" }));

    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
