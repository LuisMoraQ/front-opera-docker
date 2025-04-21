import { Component, OnInit,HostListener } from '@angular/core';

@Component({
  selector: 'app-nosotros',
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.scss']
})
export class NosotrosComponent implements OnInit {

  menuActive = false;
  isSidebarHidden=false

  currentImage = 'assets/sky.jpg'; // Cambia esta ruta según tus necesidades
  toggleMenu() {
    this.menuActive = !this.menuActive;
    this.isSidebarHidden = !this.isSidebarHidden; 
  }
  constructor() { }

  ngOnInit(): void {
  }

}
