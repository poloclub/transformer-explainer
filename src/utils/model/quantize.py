import onnx
from onnxruntime.quantization import quantize_dynamic, QuantType

# modelname="gpt2"
modelname="gpt2-medium"


model_fp32 = "src/utils/model/params_output/"+ modelname +".onnx"
model_quant = "src/utils/model/params_output/"+modelname+'-quant.onnx'

quantize_dynamic(model_fp32, model_quant, weight_type=QuantType.QInt8)