// Senhas com bcrypt. Dono: M1.
import bcrypt from 'bcryptjs';

export const SENHA_MINIMA = 8;

export function gerarHashSenha(senha: string): Promise<string> {
  if (senha.length < SENHA_MINIMA) throw new Error(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
  return bcrypt.hash(senha, 10);
}

export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
