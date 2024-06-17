import os

modelname="gpt2"
file_path = "src/utils/model/params_output/"+modelname+'-quant.onnx'
chunk_path='static/'+modelname+'-quant.onnx'


def split_file(file_path, chunk_size):
    file_number = 0
    with open(file_path, 'rb') as file:
        chunk = file.read(chunk_size)
        while chunk:
            with open(f"{chunk_path}.part{file_number}", 'wb') as chunk_file:
                chunk_file.write(chunk)
            file_number += 1
            chunk = file.read(chunk_size)

chunk_size = 20 * 1024 * 1024  # chunk by 20MB
split_file(file_path, chunk_size)