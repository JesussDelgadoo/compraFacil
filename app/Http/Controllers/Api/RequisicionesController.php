<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SolicitudCompra;
use DB;

class RequisicionesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return SolicitudCompra::with(['usuario', 'producto'])->orderBy('id_solicitud', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'fecha' => 'nullable|date',
            'fecha_estimada' => 'nullable|date',
            'motivo' => 'required|string|max:255',
            'estado' => 'nullable|string|max:50',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1'
        ]);

        $ultimoId = SolicitudCompra::max('id_solicitud') ?? 0;
        $data['folio'] = 'SOL-' . str_pad($ultimoId + 1, 3, '0', STR_PAD_LEFT);

        if(empty($data['estado'])) {
            $data['estado'] = 'Borrador';
        }

        $requisicion = SolicitudCompra::create($data);
        return response()->json($requisicion->load(['usuario', 'producto']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $requisicion = SolicitudCompra::with(['usuario', 'detalles.producto'])->findOrFail($id);
        return response()->json($requisicion);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $requisicion = SolicitudCompra::findOrFail($id);

        $data = $request->validate([
            'folio' => 'sometimes|required|string|max:20',
            'fecha' => 'nullable|date',
            'motivo' => 'sometimes|required|string|max:255',
            'estado' => 'nullable|string|max:50',
            'id_usuario' => 'sometimes|required|exists:usuarios,id_usuario',
            'id_producto' => 'sometimes',
        ]);

        $requisicion->update($data);
        return response()->json($requisicion->load('usuario'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $requisicion = SolicitudCompra::findOrFail($id);
        $requisicion->delete();
        return response()->noContent();
    }

    public function resumen()
    {
        $rows = DB::table('solicitudes_compra')
            ->select('estado', DB::raw('COUNT(*) as total'))
            ->groupBy('estado')
            ->get()
            ->keyBy('estado');

        $aprobados  = (int) ($rows['Aprobada']->total ?? 0);
        $rechazadas = (int) ($rows['Rechazada']->total ?? 0);
        $enProceso  = (int) ($rows['Pendiente']->total ?? 0)
                    + (int) ($rows['Enviada']->total ?? 0)
                    + (int) ($rows['Borrador']->total ?? 0);
        $total = $enProceso + $aprobados + $rechazadas;

        return response()->json([
            'total'      => $total,
            'enProceso'  => $enProceso,
            'aprobados'  => $aprobados,
            'rechazadas' => $rechazadas,
        ]);
    }

    public function aprobadasPorDepartamento()
    {
        $rows = DB::table('solicitudes_compra as s')
            ->join('usuarios as u', 'u.id_usuario', '=', 's.id_usuario')
            ->join('departamentos as d', 'd.id_departamento', '=', 'u.id_departamento')
            ->where('s.estado', 'Aprobada')
            ->select('d.nombre_departamento as departamento', DB::raw('COUNT(*) as total'))
            ->groupBy('d.nombre_departamento')
            ->orderByDesc('total')
            ->get();

        return response()->json($rows);
    }

    public function aprobadasPorMes()
    {
        $rows = DB::table('solicitudes_compra as s')
            ->where('s.estado', 'Aprobada')
            ->whereYear('s.fecha', 2026)
            ->select(DB::raw('MONTH(s.fecha) as mes'), DB::raw('COUNT(*) as total'))
            ->groupBy('mes')
            ->orderBy('mes', 'asc')
            ->get()
            ->keyBy('mes');

        // Devolvemos los 12 meses, aunque esten en 0
        $out = [];
        for ($m = 1; $m <= 12; $m++) {
            $out[] = [
                'mes' => $m,
                'total' => (int)($rows[$m]->total ?? 0),
            ];
        }

        return response()->json([
            'anio' => 2026,
            'data' => $out,
        ]);
    }
}
