import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InvertirColorService {

  constructor() { }

  invertirColor(color) {
    let complementaryColor: any = '#000000';
    if (color) {
      complementaryColor = this.getComplementaryColor(color);
    }
    return complementaryColor;
  }
  
  async hexToRgb(hex) {
    // Quita el símbolo '#' si está presente
    hex = hex.replace(/^#/, '');

    // Convierte el hex en RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }
  async rgbToHex(r, g, b) {
    // Convierte los valores RGB a formato hexadecimal
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  async getComplementaryColor(hex) {
    // Obtiene el color RGB a partir del hexadecimal
    const { r, g, b } = await this.hexToRgb(hex);

    // Calcula el color complementario
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;

    // Convierte el color complementario a formato hexadecimal
    return this.rgbToHex(compR, compG, compB);
  }

  
}
