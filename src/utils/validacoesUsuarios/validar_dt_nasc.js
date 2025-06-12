function validarDataNascimento(data, idadeMinima = 12) {
    if (!data) return false;
    const dataNasc = new Date(data);
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();

    if (
        idade > idadeMinima ||
        (idade === idadeMinima && mes >= 0 && hoje.getDate() >= dataNasc.getDate())
    ) {
        return true;
    }

    return false;
}

module.exports = validarDataNascimento;
