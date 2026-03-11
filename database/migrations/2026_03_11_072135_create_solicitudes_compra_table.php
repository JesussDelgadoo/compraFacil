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
        Schema::create('solicitudes_compra', function (Blueprint $table) {
            $table->id('id_solicitud');
            
            $table->string('folio', 20);
            
            $table->dateTime('fecha')->default(DB::raw('CURRENT_TIMESTAMP'));
            
            $table->string('motivo', 255);
            $table->string('estado', 50)->default('Borrador');
            
            $table->foreignId('id_usuario')
                ->constrained('usuarios', 'id_usuario')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitudes_compra');
    }
};
