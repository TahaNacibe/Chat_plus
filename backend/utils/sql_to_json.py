def rows_to_json(rows, labels):
    return [dict(zip(labels, row)) for row in rows]
