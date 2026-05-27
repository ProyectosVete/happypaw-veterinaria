import sqlite3
import json

print("Exportando base de datos SQLite a formato SQL...")

# Conectar a SQLite
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Obtener todas las tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = cursor.fetchall()

sql_output = []

for table in tables:
    table_name = table[0]
    
    # Saltar tablas internas de Django
    if table_name.startswith('sqlite_') or table_name.startswith('django_'):
        continue
    
    print(f"Procesando tabla: {table_name}")
    
    # Obtener CREATE TABLE
    cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';")
    create_sql = cursor.fetchone()[0]
    sql_output.append(f"{create_sql};\n")
    
    # Obtener datos
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    
    if rows:
        # Obtener nombres de columnas
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [col[1] for col in cursor.fetchall()]
        
        for row in rows:
            values = []
            for val in row:
                if val is None:
                    values.append('NULL')
                elif isinstance(val, str):
                    # Escapar comillas simples
                    val_escaped = val.replace("'", "''")
                    values.append(f"'{val_escaped}'")
                elif isinstance(val, (int, float)):
                    values.append(str(val))
                else:
                    values.append(f"'{str(val)}'")
            
            sql_output.append(f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(values)});")
        sql_output.append("")

# Guardar archivo
output_file = 'exportacion_mysql_completa.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_output))

print(f"\nExportación completada: {output_file}")
print(f" Total de tablas exportadas: {len([t for t in tables if not t[0].startswith(('sqlite_', 'django_'))])}")

conn.close()