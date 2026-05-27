import sqlite3
import re

print("📁 Exportando SQLite a MySQL compatible...")

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Obtener todas las tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = cursor.fetchall()

sql_lines = []
sql_lines.append("-- Base de datos para Sistema Veterinario")
sql_lines.append("CREATE DATABASE IF NOT EXISTS veterinaria_db;")
sql_lines.append("USE veterinaria_db;")
sql_lines.append("SET FOREIGN_KEY_CHECKS=0;")
sql_lines.append("")

for table in tables:
    table_name = table[0]
    
    # Saltar tablas internas
    if table_name.startswith('sqlite_') or table_name.startswith('django_content') or table_name.startswith('django_migrations') or table_name.startswith('django_session') or table_name.startswith('auth_'):
        continue
    
    print(f"📋 Procesando: {table_name}")
    
    # Obtener CREATE TABLE
    cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';")
    create_sql = cursor.fetchone()[0]
    
    # Convertir a MySQL compatible
    create_sql = create_sql.replace('"', '`')
    create_sql = create_sql.replace('AUTOINCREMENT', 'AUTO_INCREMENT')
    create_sql = re.sub(r'integer PRIMARY KEY AUTO_INCREMENT', 'int PRIMARY KEY AUTO_INCREMENT', create_sql, flags=re.IGNORECASE)
    create_sql = create_sql.replace('text NOT NULL UNIQUE', 'varchar(255) NOT NULL UNIQUE')
    create_sql = create_sql.replace('text', 'varchar(255)')
    create_sql = create_sql.replace('datetime', 'datetime')
    
    sql_lines.append(f"-- Crear tabla: {table_name}")
    sql_lines.append(f"DROP TABLE IF EXISTS `{table_name}`;")
    sql_lines.append(f"{create_sql};")
    sql_lines.append("")
    
    # Obtener datos
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    
    if rows:
        # Obtener columnas
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [col[1] for col in cursor.fetchall()]
        
        for row in rows:
            values = []
            for val in row:
                if val is None:
                    values.append('NULL')
                elif isinstance(val, str):
                    val = val.replace("'", "''")
                    values.append(f"'{val}'")
                elif isinstance(val, (int, float)):
                    values.append(str(val))
                else:
                    values.append(f"'{str(val)}'")
            
            sql_lines.append(f"INSERT INTO `{table_name}` (`{'`, `'.join(columns)}`) VALUES ({', '.join(values)});")
        sql_lines.append("")

sql_lines.append("SET FOREIGN_KEY_CHECKS=1;")

# Guardar archivo
with open('importar_mysql.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"\n✅ Exportación completada: importar_mysql.sql")
print(f"📊 Tamaño del archivo: {len(open('importar_mysql.sql').read()) / 1024:.2f} KB")

conn.close()