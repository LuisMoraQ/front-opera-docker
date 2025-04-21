import { Injectable } from '@angular/core';
// import { IFCLoader } from 'web-ifc';

// import * as THREE from 'three';
@Injectable({
  providedIn: 'root'
})
export class IfcService {
  // private ifcLoader: IFCLoader;
  // private scene: THREE.Scene;
  // private camera: THREE.PerspectiveCamera;
  // private renderer: THREE.WebGLRenderer;

  // constructor() {
  //   this.ifcLoader = new IFCLoader();
  //   this.scene = new THREE.Scene();
  //   this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  //   this.renderer = new THREE.WebGLRenderer();
  //   this.renderer.setSize(window.innerWidth, window.innerHeight);
  //   document.body.appendChild(this.renderer.domElement);
  //   this.camera.position.z = 5;
  // }

  // async loadIFC(file: File): Promise<void> {
  //   const reader = new FileReader();
    
  //   return new Promise<void>((resolve, reject) => {
  //     reader.onload = async (event: any) => {
  //       try {
  //         const arrayBuffer = event.target.result as ArrayBuffer;
  //         const model = await this.ifcLoader.parse(arrayBuffer);
  //         this.scene.add(model);
  //         this.render();
  //         resolve();
  //       } catch (error) {
  //         reject(error);
  //       }
  //     };
      
  //     reader.onerror = (error) => {
  //       reject(error);
  //     };

  //     reader.readAsArrayBuffer(file);
  //   });
  // }

  // private render() {
  //   requestAnimationFrame(() => this.render());
  //   this.renderer.render(this.scene, this.camera);
  // }
}
