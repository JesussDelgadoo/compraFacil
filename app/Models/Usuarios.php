<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuarios extends Authenticatable 
{
    use HasApiTokens;

    protected $table = 'usuarios';
    
    protected $primaryKey = 'id_usuario'; 
    public $timestamps = false;

    protected $fillable = ['nombre_completo', 'email','password', 'id_rol', 'id_departamento'];
    protected $hidden = ['password'];

    public function departamento(){
        return $this->belongsTo(Departamentos::class, 'id_departamento', 'id_departamento');
    }

    public function empleado(){
        return $this->hasOne(Empleados::class, 'id_usuario', 'id_usuario');
    }

    public function rol(){
        return $this->belongsTo(Roles::class, 'id_rol', 'id_rol');
    }

    public function getAuthPassword(){
        return $this->password;
    }
}