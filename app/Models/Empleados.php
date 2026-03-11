<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empleados extends Model
{
    protected $table = 'empleados';
    
    protected $primaryKey = 'id_empleado'; 
    
    public $timestamps = false; 

    protected $fillable = [
        'id_usuario',
        'numero_empleado',
        'fecha_contratacion',
        'puesto_especifico'
    ];

    public function usuario(){
        return $this->belongsTo(Usuarios::class, 'id_usuario', 'id_usuario');
    }
}
