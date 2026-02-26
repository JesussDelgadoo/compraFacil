<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamentos extends Model
{
    //
    protected $table = 'departamentos';
    protected $fillable = ['nombre_departamento'];

    public function usuarios(){
        return $this->hasMany(Usuarios::class);
    }
}
