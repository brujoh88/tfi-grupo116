import { BadRequestException, Injectable } from '@nestjs/common';
import { AgendaService } from '../agenda/agenda.service';
import { CatalogoService } from '../catalogo/catalogo.service';
import { GrillaService } from '../grilla/grilla.service';
import { AbrirHorarioDto, DiaDelPanel } from './panel.types';

@Injectable()
export class PanelService {
  constructor(
    private readonly agenda: AgendaService,
    private readonly grilla: GrillaService,
    private readonly catalogo: CatalogoService,
  ) {}

  /**
   * El día del salón: cada lugar con lo que tiene abierto y sus turnos. No
   * calcula nada propio: lo abierto lo sabe la grilla, lo tomado la agenda, y
   * los nombres el catálogo.
   */
  async verDia(fecha: string): Promise<DiaDelPanel> {
    const [{ lugares }, reservas, catalogo] = await Promise.all([
      this.grilla.delDia({ fecha }),
      this.agenda.reservasDelDia(fecha),
      this.catalogo.consultar(),
    ]);

    const nombres = new Map<string, string>();
    for (const servicio of catalogo.servicios) {
      nombres.set(`s${servicio.id}`, servicio.nombre);
      for (const extra of servicio.extras)
        nombres.set(`e${extra.id}`, extra.nombre);
    }
    for (const retiro of catalogo.retiros)
      nombres.set(`r${retiro.id}`, retiro.nombre);
    // Un servicio dado de baja ya no está en el catálogo, pero su turno sigue.
    const nombre = (clave: string) => nombres.get(clave) ?? 'Dado de baja';

    return {
      fecha,
      lugares: lugares.map((lugar) => ({
        ...lugar,
        reservas: reservas
          .filter((r) => r.lugarId === lugar.id)
          .map((r) => ({
            id: r.id,
            inicio: r.inicioMinuto,
            fin: r.finMinuto,
            clienta: r.clienta.nombre,
            telefono: r.clienta.telefono,
            servicio: nombre(`s${r.servicioId}`),
            extras: r.extras.map((e) => nombre(`e${e.extraId}`)),
            retiro: r.retiroId ? nombre(`r${r.retiroId}`) : null,
          })),
      })),
    };
  }

  /** Abre el tramo y devuelve el día como quedó. */
  async abrir(apertura: AbrirHorarioDto): Promise<DiaDelPanel> {
    if (apertura.hasta <= apertura.desde) {
      throw new BadRequestException(
        'El horario tiene que terminar después de empezar',
      );
    }
    await this.grilla.abrir(apertura);
    return this.verDia(apertura.fecha);
  }
}
