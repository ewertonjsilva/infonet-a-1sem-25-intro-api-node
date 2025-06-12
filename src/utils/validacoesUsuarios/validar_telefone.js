function validarTelefone(telefone) {
    // Aceita 11 dígitos, começando com 9 após o DDD
    const telefoneSemMascara = telefone.replace(/\D/g, '');
    return (telefoneSemMascara.length < 10 || telefoneSemMascara.length > 11);
}

module.exports = validarTelefone;

(telefoneSemMascara.length < 10 || telefoneSemMascara.length > 11)