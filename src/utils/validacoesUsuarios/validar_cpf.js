function validarCPF(cpf) {
    if (typeof cpf !== 'string') return false;
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
    let dig1 = (soma * 10) % 11;
    if (dig1 === 10 || dig1 === 11) dig1 = 0;
    if (dig1 !== Number(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
    let dig2 = (soma * 10) % 11;
    if (dig2 === 10 || dig2 === 11) dig2 = 0;
    if (dig2 !== Number(cpf[10])) return false;

    return true;
}

module.exports = validarCPF;
