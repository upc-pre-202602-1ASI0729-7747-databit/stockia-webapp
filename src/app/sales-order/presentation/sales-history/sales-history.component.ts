import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../application/sales.service';
import { SaleStatus, SALE_STATUS_LABEL, SALE_CHANNEL_LABEL } from '../../domain/sale.entity';

// Vista del Bounded Context Sales / Order Management (US27: "Recopilar y
// aprender continuamente de los datos históricos de venta"). Sin un registro
// real de Sale no hay de dónde recopilar históricos de venta — esta pantalla
// es, junto con SalesService, la cobertura real de esa historia de usuario.
@Component({
    selector: 'app-sales-history',
    imports: [CommonModule],
    templateUrl: './sales-history.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './sales-history.component.css'
})
export class SalesHistoryComponent implements OnInit {
  sales = inject(SalesService);

  statusLabel = SALE_STATUS_LABEL;
  channelLabel = SALE_CHANNEL_LABEL;
  SaleStatus = SaleStatus;

  ngOnInit() {
    this.sales.loadSales().subscribe();
  }

  statusClass(status: SaleStatus) {
    return status === SaleStatus.VOIDED ? 'badge badge-danger' : 'badge badge-success';
  }

  dishesSummary(sale: { lineItems: { dishName: string; quantity: number }[] }) {
    return sale.lineItems.map((l) => `${l.dishName} ×${l.quantity}`).join(', ');
  }

  voidSale(id: number) {
    if (confirm('¿Anular esta venta?')) {
      this.sales.void(id).subscribe();
    }
  }
}
