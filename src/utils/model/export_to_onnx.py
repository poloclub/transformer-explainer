import torch
from model import GPT  # import model
import os
# from onnxruntime.transformers import optimizer, float16
# import onnx

modelname="gpt2"

def create_folder_if_not_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        print(f"Folder '{folder_path}' created.")
    else:
        print(f"Folder '{folder_path}' already exists.")

# Example usage
folder_path = 'src/utils/model/params_output'
create_folder_if_not_exists(folder_path)

# create wrapper function to extract outputs from dictionary
class wrapper(torch.nn.Module):
    def __init__(self, model):
        super(wrapper, self).__init__()
        self.model = model

    def forward(self, input):
        outputs = self.model(input)
        # extract values from dictionary and return them as separate outputs
        return (
            # outputs["embedding"]["tok_emb"],
            # outputs["embedding"]["transformer.wpe.weight"],
            # outputs["embedding"]["pos_emb"],
            # outputs["embedding"]["input_emb"],
            # outputs["embedding"]["input_emb_dropout"],
            # outputs["block"]["block_0"]["ln_1"]["input_mean"],
            # outputs["block"]["block_0"]["ln_1"]["input_var"],
            # outputs["block"]["block_0"]["ln_1"]["input_normalized"],
            # outputs["block"]["block_0"]["ln_1"]["weight"],
            # outputs["block"]["block_0"]["ln_1"]["bias"],
            # outputs["block"]["block_0"]["ln_1"]["output"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["q_weights"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["k_weights"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["v_weights"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["q_bias"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["k_bias"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["v_bias"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["q"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["k"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["v"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["q_transposed"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["k_transposed"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["v_transposed"],
            outputs["block"]["block_0"]["attn"]["head_0"]["attn"],
            outputs["block"]["block_0"]["attn"]["head_0"]["attn_scaled"],
            outputs["block"]["block_0"]["attn"]["head_0"]["attn_masked"],
            outputs["block"]["block_0"]["attn"]["head_0"]["attn_softmax"],
            outputs["block"]["block_0"]["attn"]["head_0"]["attn_dropout"],
            # outputs["block"]["block_0"]["attn"]["head_0"]["v_output"],
            # outputs["block"]["block_0"]["attn"]["v_output_combined"],
            # outputs["block"]["block_0"]["attn"]["proj_weights"],
            # outputs["block"]["block_0"]["attn"]["proj_bias"],
            # outputs["block"]["block_0"]["attn"]["attn_output"],
            # outputs["block"]["block_0"]["res_1"],
            # outputs["block"]["block_0"]["ln_2"]["input_mean"],
            # outputs["block"]["block_0"]["ln_2"]["input_var"],
            # outputs["block"]["block_0"]["ln_2"]["input_normalized"],
            # outputs["block"]["block_0"]["ln_2"]["weight"],
            # outputs["block"]["block_0"]["ln_2"]["bias"],
            # outputs["block"]["block_0"]["ln_2"]["output"],
            # outputs["block"]["block_0"]["mlp"]["linear_1_weight"],
            # outputs["block"]["block_0"]["mlp"]["linear_1_bias"],
            # outputs["block"]["block_0"]["mlp"]["linear_1_output"],
            # outputs["block"]["block_0"]["mlp"]["gelu_output"],
            # outputs["block"]["block_0"]["mlp"]["linear_2_weight"],
            # outputs["block"]["block_0"]["mlp"]["linear_2_bias"],
            # outputs["block"]["block_0"]["mlp"]["linear_2_output"],
            # outputs["block"]["block_0"]["mlp"]["output_after_dropout"],
            # outputs["block"]["block_0"]["res_2"],
            # outputs["ln_f"]["input_mean"],
            # outputs["ln_f"]["input_var"],
            # outputs["ln_f"]["input_normalized"],
            # outputs["ln_f"]["weight"],
            # outputs["ln_f"]["bias"],
            # outputs["ln_f"]["output"],
            # outputs["linear"]["weight"],
            outputs["linear"]["output"],
        )

# initialize model
model = GPT.from_pretrained(modelname)
model.eval()
wrapped_model = wrapper(model)

# optimized_model = optimizer.optimize_model("gpt2.onnx", model_type='gpt2', num_heads=12, hidden_size=768)
# optimized_model.convert_model_float32_to_float16()
# optimized_model.save_model_to_file("gpt2_fp16.onnx")

# create dummy input
dummy_input = torch.tensor([[6601, 32704, 795, 30132, 2985, 284]])
# dummy_input = torch.randint(0, 50257, (1, 1), dtype=torch.long)

# export model to ONNX
onnx_model_path = "src/utils/model/params_output/"+ modelname +".onnx"

torch.onnx.export(
    wrapped_model,
    dummy_input,
    # "src/utils/model/params_output/model.onnx",
    onnx_model_path,
    export_params=True,
    opset_version=11,
    do_constant_folding=True,
    input_names=["input"],
    # output_names=[
    #     "tok_emb", "transformer_wpe_weight", "pos_emb", "input_emb", "input_emb_dropout",
    #     "block_0_ln_1_input_mean", "block_0_ln_1_input_var", "block_0_ln_1_input_normalized", "block_0_ln_1_weight", "block_0_ln_1_bias", "block_0_ln_1_output",
    #     "block_0_attn_head_0_q_weights", "block_0_attn_head_0_k_weights", "block_0_attn_head_0_v_weights", "block_0_attn_head_0_q_bias", "block_0_attn_head_0_k_bias", "block_0_attn_head_0_v_bias",
    #     "block_0_attn_head_0_q", "block_0_attn_head_0_k", "block_0_attn_head_0_v", "block_0_attn_head_0_q_transposed", "block_0_attn_head_0_k_transposed", "block_0_attn_head_0_v_transposed",
    #     "block_0_attn_head_0_attn", "block_0_attn_head_0_attn_scaled", "block_0_attn_head_0_attn_masked", "block_0_attn_head_0_attn_softmax", "block_0_attn_head_0_attn_dropout", "block_0_attn_head_0_v_output",
    #     "block_0_attn_v_output_combined", "block_0_attn_proj_weights", "block_0_attn_proj_bias", "block_0_attn_attn_output",
    #     "block_0_res_1",
    #     "block_0_ln_2_input_mean", "block_0_ln_2_input_var", "block_0_ln_2_input_normalized", "block_0_ln_2_weight", "block_0_ln_2_bias", "block_0_ln_2_output",
    #     "block_0_mlp_linear_1_weight", "block_0_mlp_linear_1_bias", "block_0_mlp_linear_1_output", "block_0_mlp_gelu_output", "block_0_mlp_linear_2_weight", "block_0_mlp_linear_2_bias", "block_0_mlp_linear_2_output", "block_0_mlp_output_after_dropout",
    #     "block_0_res_2",
    #     "ln_f_input_mean", "ln_f_input_var", "ln_f_input_normalized", "ln_f_weight", "ln_f_bias", "ln_f_output",
    #     "linear_weight", 
    #     "linear_output"
    # ],
        output_names=[
"block_0_attn_head_0_attn", "block_0_attn_head_0_attn_scaled", "block_0_attn_head_0_attn_masked", "block_0_attn_head_0_attn_softmax", "block_0_attn_head_0_attn_dropout",
        "linear_output"
    ],
    dynamic_axes={
        'input': {0: '0', 1: '1'},
        # 'tok_emb': {0: '0', 1: '1'},
        # 'transformer_wpe_weight': {0: '0'},
        # 'pos_emb': {0: '0'},
        # 'input_emb': {0: '0', 1: '1'},
        # 'input_emb_dropout': {0: '0', 1: '1'},
        # 'block_0_ln_1_input_mean': {0: '0', 1: '1'},
        # 'block_0_ln_1_input_var': {0: '0', 1: '1'},
        # 'block_0_ln_1_input_normalized': {0: '0', 1: '1', 2: '2'},
        # 'block_0_ln_1_weight': {0: '0'},
        # 'block_0_ln_1_bias': {0: '0'},
        # 'block_0_ln_1_output': {0: '0', 1: '1'},
        # 'block_0_attn_head_0_q_weights': {0: '0', 1: '1'},
        # 'block_0_attn_head_0_k_weights': {0: '0', 1: '1'},
        # 'block_0_attn_head_0_v_weights': {0: '0', 1: '1'},
        # 'block_0_attn_head_0_q_bias': {0: '0'},
        # 'block_0_attn_head_0_k_bias': {0: '0'},
        # 'block_0_attn_head_0_v_bias': {0: '0'},
        # 'block_0_attn_head_0_q': {0: '0', 1: '1', 2: '2'},
        # 'block_0_attn_head_0_k': {0: '0', 1: '1', 2: '2'},
        # 'block_0_attn_head_0_v': {0: '0', 1: '1', 2: '2'},
        # 'block_0_attn_head_0_q_transposed': {0: '0', 1: '1', 2: '2'},
        # 'block_0_attn_head_0_k_transposed': {0: '0', 1: '1', 2: '2'},
        # 'block_0_attn_head_0_v_transposed': {0: '0', 1: '1', 2: '2'},
        'block_0_attn_head_0_attn': {0: '0', 1: '1', 2: '2'},
        'block_0_attn_head_0_attn_scaled': {0: '0', 1: '1', 2: '2'},
        'block_0_attn_head_0_attn_masked': {0: '0', 1: '1', 2: '2'},
        'block_0_attn_head_0_attn_softmax': {0: '0', 1: '1', 2: '2'},
        'block_0_attn_head_0_attn_dropout': {0: '0', 1: '1', 2: '2'},
        # 'block_0_attn_head_0_v_output': {0: '0', 1: '1', 2: '2'},
        # 'block_0_attn_v_output_combined': {0: '0', 1: '1', 2: '2'},
        # 'block_0_attn_proj_weights': {0: '0', 1: '1'},
        # 'block_0_attn_proj_bias': {0: '0'},
        # 'block_0_attn_attn_output': {0: '0', 1: '1', 2: '2'},
        # 'block_0_res_1': {0: '0', 1: '1', 2: '2'},
        # 'block_0_ln_2_input_mean': {0: '0', 1: '1'},
        # 'block_0_ln_2_input_var': {0: '0', 1: '1'},
        # 'block_0_ln_2_input_normalized': {0: '0', 1: '1', 2: '2'},
        # 'block_0_ln_2_weight': {0: '0'},
        # 'block_0_ln_2_bias': {0: '0'},
        # 'block_0_ln_2_output': {0: '0', 1: '1'},
        # 'block_0_mlp_linear_1_weight': {0: '0', 1: '1'},
        # 'block_0_mlp_linear_1_bias': {0: '0'},
        # 'block_0_mlp_linear_1_output': {0: '0', 1: '1', 2: '2'},
        # 'block_0_mlp_gelu_output': {0: '0', 1: '1', 2: '2'},
        # 'block_0_mlp_linear_2_weight': {0: '0', 1: '2'},
        # 'block_0_mlp_linear_2_bias': {0: '0'},
        # 'block_0_mlp_linear_2_output': {0: '0', 1: '1', 2: '2'},
        # 'block_0_mlp_output_after_dropout': {0: '0', 1: '1', 2: '2'},
        # 'block_0_res_2': {0: '0', 1: '1', 2: '2'},
        # 'ln_f_input_mean': {0: '0', 1: '1'},
        # 'ln_f_input_var': {0: '0', 1: '1'},
        # 'ln_f_input_normalized': {0: '0', 1: '1', 2: '2'},
        # 'ln_f_weight': {0: '0'},
        # 'ln_f_bias': {0: '0'},
        # 'ln_f_output': {0: '0', 1: '1'},
        # 'linear_weight': {0: '0', 1: '2'},
        'linear_output': {0: '0', 1: '1', 2: '2'}
    }
)

print("Model has been successfully exported to ONNX format.")

