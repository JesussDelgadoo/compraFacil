<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('empleados', function (Blueprint $table) {
            $table->id('id_empleado');
            $table->foreignId('id_usuario')->constrained('usuarios', 'id_usuario')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('numero_empleado', 50)->nullable();
            $table->date('fecha_contratacion')->nullable();
            $table->string('puesto_especifico', 100)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empleados');
    }
};
