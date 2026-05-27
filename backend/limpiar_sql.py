# limpiar_sql.py
print("Limpiando archivo SQL para evitar duplicados...")

with open('importar_mysql_final.sql', 'r', encoding='utf-8') as f:
    contenido = f.read()

# Reemplazar INSERT por INSERT IGNORE
contenido = contenido.replace('INSERT INTO', 'INSERT IGNORE INTO')

# Guardar archivo limpio
with open('importar_mysql_limpio.sql', 'w', encoding='utf-8') as f:
    f.write(contenido)

print("✅ Archivo creado: importar_mysql_limpio.sql")
