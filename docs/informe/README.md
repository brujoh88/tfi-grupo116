# El informe final

- **`informe.pdf`** — el informe que se entrega.
- **`informe.md`** — su fuente. El PDF se regenera desde acá; no se edita a mano.
- **`img/`** — las capturas de las pantallas.

Para regenerar el PDF hacen falta `pandoc` y LibreOffice:

```bash
cd docs/informe
pandoc informe.md --resource-path=.:.. -o informe.docx
libreoffice --headless --convert-to pdf informe.docx
rm informe.docx
```
