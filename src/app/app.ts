import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar';
import { ReaderBarComponent } from './reader-bar/reader-bar';
import { EstrategiaComponent } from './topics/estrategia/estrategia';
import { VisaoComponent } from './topics/visao/visao';
import { WaComponent } from './topics/wa/wa';
import { VantagensComponent } from './topics/vantagens/vantagens';
import { CafComponent } from './topics/caf/caf';
import { ComputeComponent } from './topics/compute/compute';
import { MlComponent } from './topics/ml/ml';
import { SegComponent } from './topics/seg/seg';
import { OutrosComponent } from './topics/outros/outros';
import { GerenciadoComponent } from './topics/gerenciado/gerenciado';
import { FamiliaComponent } from './topics/familia/familia';
import { AnalyticsComponent } from './topics/analytics/analytics';
import { EstimarComponent } from './topics/estimar/estimar';
import { MoverComponent } from './topics/mover/mover';
import { FirewallsComponent } from './topics/firewalls/firewalls';
import { ConectarComponent } from './topics/conectar/conectar';
import { GuiaSegurancaComponent } from './topics/guia-seguranca/guia-seguranca';
import { GuiaRedesComponent } from './topics/guia-redes/guia-redes';
import { GuiaArmazenamentoComponent } from './topics/guia-armazenamento/guia-armazenamento';
import { GuiaGestaoComponent } from './topics/guia-gestao/guia-gestao';
import { Dominio1Component } from './topics/dominio-1/dominio-1';
import { Dominio2Component } from './topics/dominio-2/dominio-2';
import { Dominio3Component } from './topics/dominio-3/dominio-3';
import { Dominio4Component } from './topics/dominio-4/dominio-4';

@Component({
  selector: 'app-root',
  imports: [
    SidebarComponent,
    ReaderBarComponent,
    EstrategiaComponent,
    VisaoComponent,
    WaComponent,
    VantagensComponent,
    CafComponent,
    ComputeComponent,
    MlComponent,
    SegComponent,
    OutrosComponent,
    GerenciadoComponent,
    FamiliaComponent,
    AnalyticsComponent,
    EstimarComponent,
    MoverComponent,
    FirewallsComponent,
    ConectarComponent,
    GuiaSegurancaComponent,
    GuiaRedesComponent,
    GuiaArmazenamentoComponent,
    GuiaGestaoComponent,
    Dominio1Component,
    Dominio2Component,
    Dominio3Component,
    Dominio4Component,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
