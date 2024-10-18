import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-notifinal',
  templateUrl: './notifinal.page.html',
  styleUrls: ['./notifinal.page.scss'],
})
export class NotifinalPage implements OnInit {
  finishedIncidents: any[] = [];
  incidents: any[] = [];
  user: any = {};
  utilsSvc = inject(UtilsService);
  firebaseSvc = inject(FirebaseService);

  constructor(private firebaseService: FirebaseService, private router: Router) { }

  ngOnInit() {
    this.loadUserData();
  }

  ionViewWillEnter() {
    this.loadFinishedIncidents();
  }

  async loadFinishedIncidents() {
    try {
      const allIncidents = await this.firebaseService.getIncidents();
      if (this.user && this.user.Cargo) {
        this.finishedIncidents = allIncidents.filter(incident => 
          incident.status === 'finalizado' && incident.type === this.user.Cargo
        );
      } else {
        console.warn('No se pudo obtener el cargo del usuario. No se pueden cargar incidentes filtrados.');
      }
    } catch (error) {
      console.error('Error al recuperar incidentes finalizados:', error);
    }
  }

  viewIncident(incident: any) {
    this.router.navigate(['./main/historial', { id: incident.id }]);
  }

  async loadUserData() {
    const email = this.utilsSvc.getFromLocalStorage('user')?.email;
    if (email) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
      try {
        const user = await this.firebaseSvc.getUserByEmail(email);
        if (user) {
          this.user = user;
          this.loadFinishedIncidents();
        } else {
          throw new Error('Usuario no encontrado');
        }
      } catch (error: any) {
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 1500,
          color: 'secondary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } finally {
        loading.dismiss();
      }
    }
  }
}

