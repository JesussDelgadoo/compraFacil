<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empleados extends Model
{
    //
    protected $table = 'empleados';
    // protected $fillable = ['nombre','ap','am','idDepartamento'];
    protected $fillable = ['id_usuario','numero_empleado','fecha_contratacion','puesto_especifico'];

    public function departamentos(){
        return $this->belongsTo(Departamentos::class,'id_departamento','id');
    }

    public function usuario(){
        return $this->belongsTo(Usuarios::class, 'id_usuario');
    }
}
