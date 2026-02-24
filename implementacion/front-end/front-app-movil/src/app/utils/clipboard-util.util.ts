export async function pegarDesdeClipboard(): Promise<string> {
  try {
    const texto = await navigator.clipboard.readText();
    console.log('Texto del clipboard:', texto);
    return texto;
  } catch (err) {
    console.error('Error al leer clipboard:', err);
    return '';
  }
}
