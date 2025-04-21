import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.scss']
})
export class PlanesComponent implements OnInit {

  constructor(private router: Router) { 
  }

  menuActive = false;


  currentImage = 'assets/sky.jpg'; // Cambia esta ruta según tus necesidades

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }
  modulosVisible = true;
  submodulosVisible = true;
  proyectosVisible = true;
  panelAccesosVisible = true;

  imageUrl: string = 'assets/img-menu/fondos/verde.jpg';
  imageUr2: string = 'assets/img-menu/fondos/azul.jpg';
  imageUr3: string = 'assets/img-menu/fondos/rojo.jpg';
  imageUr4: string = 'assets/img-menu/fondos/morado.jpg';
  
  toggleModulos() {
    this.modulosVisible = !this.modulosVisible;
    // Oculta los submódulos al cerrar los módulos
    if (!this.modulosVisible) {
      this.submodulosVisible = false;
      this.proyectosVisible = false;
    }
  }
  toggleSubmodulos() {
    this.submodulosVisible = !this.submodulosVisible;
  }

  toggleProyectos() {
    this.proyectosVisible = !this.proyectosVisible;
  }

  togglePanelAccesos() {
    this.panelAccesosVisible = !this.panelAccesosVisible;
  }

  EnviarSolicitud(modulo:string){
    this.router.navigate(['/pasarela'], { queryParams: { modulo } });
  }

  ngOnInit(): void {
  }
  
}
