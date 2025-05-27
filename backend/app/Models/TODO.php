<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TODO extends Model
{
    use HasFactory;

   // Explicitly define the table name
    protected $table = 'todos';

    // Allow mass assignment for these fields
    protected $fillable = [
        'title',
        'description',
        'is_completed',
    ];

    
    protected $casts = [
        'is_completed' => 'boolean',
    ];
}
