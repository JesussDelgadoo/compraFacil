<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudCompra extends Model
{
    protected $table = 'solicitudes_compra';
    protected $primaryKey = 'id_solicitud';
    public $timestamps = false;

    protected $fillable = ['folio', 'fecha', 'fecha_estimada', 'motivo', 'estado', 'id_usuario', 'id_producto', 'cantidad'];

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'id_usuario', 'id_usuario');
    }

    public function producto()
    {
        return $this->belongsTo(Productos::class, 'id_producto', 'id_producto');
    }
}