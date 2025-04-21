import { Component, Input, OnInit } from '@angular/core';
import Gantt from 'frappe-gantt';

@Component({
  selector: 'app-tabla-gantt',
  templateUrl: './tabla-gantt.component.html',
  styleUrls: ['./tabla-gantt.component.scss']
})
export class TablaGanttComponent implements OnInit {
  tasks = []
  feriados = []
  @Input() set data(value: any) {
    this.tasks = []
    this.tasks = value
    if (this.tasks.length) {
      this.generargantt()
    }
  }
  gantt;
  constructor() { }

  ngOnInit(): void {
  }
  generargantt() {
    const face3 = document.getElementById("gantt");
    const scrollleft = face3.scrollLeft
    this.gantt = new Gantt('#gantt', this.tasks, {
      header_height: 40,//grosor de la cabezera
      column_width: 10,
      column_height: 5,
      height: 880,
      step: 50,
      // view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
      bar_height: 10,//grosor de la barra
      bar_corner_radius: 5,//borde de la barra
      // arrow_curve: 5,
      padding: 12,//grosor de  de la fila          12.25
      view_mode: 'Day',
      feriados: this.feriados,
      language: 'es',
      date_format: 'YYYY-MM-DD',
      on_click: function (task) {
        // console.log(task);
      },
      on_date_change: function (task, start, end) {
        // console.log(task, start, end);
      },
      on_progress_change: function (task, progress) {
        // console.log(task, progress);
      },
      on_view_change: function (mode) {
        // console.log(mode);
      }

    });
    face3.scrollLeft = scrollleft
  }
}
