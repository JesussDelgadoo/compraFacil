<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\EmpleadosController;
use App\Http\Controllers\Api\DepartamentosController;
use App\Http\Controllers\Api\RolesController;
use App\Http\Controllers\Api\ProductosController;
use App\Http\Controllers\Api\RequisicionesController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/departamentos',[DepartamentosController::class, 'index']);
    Route::get('/roles',[RolesController::class,'index']);
    Route::post('/usuarios/{usuario}/rehash',[UsuarioController::class,'rehashPassword']);

    Route::apiResource('usuarios', UsuarioController::class);
    Route::apiResource('empleados', EmpleadosController::class);
    Route::apiResource('productos',ProductosController::class);
    Route::apiResource('requisiciones', RequisicionesController::class);
});