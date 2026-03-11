<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Productos extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'id_producto';
    public $timestamps = false;
    
    protected $fillable = ['sku', 'nombre', 'descripcion', 'unidad_medida', 'precio_referencia'];
}