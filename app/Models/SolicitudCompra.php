<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudCompra extends Model
{
    protected $table = 'solicitudes_compra';
    protected $primaryKey = 'id_solicitud';
    public $timestamps = false;

    protected $fillable = ['folio', 'fecha', 'motivo', 'estado', 'id_usuario'];

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'id_usuario', 'id_usuario');
    }
}