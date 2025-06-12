function validarTelefone(telefone) {
    // Aceita 11 dígitos, começando com 9 após o DDD
    const telefoneSemMascara = telefone.replace(/\D/g, '');
    return /^(\d{2})9\d{8}$/.test(telefoneSemMascara);
}

module.exports = validarTelefone;

