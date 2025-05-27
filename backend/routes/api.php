<?php

use App\Http\Controllers\TODOController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['todos' => []]);
});

Route::get('/todos', [TodoController::class, 'index']);
Route::get('/todos/{tODO}', [TodoController::class, 'show']);

Route::post('/todos', [TodoController::class, 'store']);
Route::put('/todos/{tODO}', [TodoController::class, 'update']);
Route::delete('/todos/{tODO}', [TodoController::class, 'destroy']);