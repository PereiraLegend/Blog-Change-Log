const { Boletos: BoletoModel } = require("../models/BoletoModel")
const path = require('path');
const fs = require('fs');
const { response } = require("express");

const BoletoController = {
    getId: async (req, res) => {
        try {
            const id = req.params.id
            const boletos = await BoletoModel.findById(id)

            if (!boletos) {
                res.status(404).json({ msg: "Boleto não encontrado!" })
                return;
            }

            res.status(200).json(boletos)
        } catch (error) {
            console.log(`Deu erro em: ${error}`)
            res.status(400).send("Erro ao listar boleto")
        }
    },

    getAll: async (req, res) => {
        try {
            const boletos = await BoletoModel.find()
            res.status(200).json(boletos)
        } catch (error) {
            console.log(`Deu erro em: ${error}`)
            res.status(400).send("Erro ao listar boletos")
        }
    },

    getBoletosByUser: async (req,res) => {
        try {
            const { usuario } = req.params;
            const boleto = await BoletoModel.find({ usuario });

            if (!boleto || boleto.length == 0 ) {
                return res.status(404).json({ msg: "Boleto não encontrado!" });
            }

            res.status(200).json(boleto);
        } catch (error) {
            console.error(`Erro ao buscar ID do boleto pelo nome: ${error}`);
            res.status(400).send("Erro ao buscar ID do boleto pelo nome");
        }
    },

    create: async (req, res) => {
        try {

            const file = req.file

            const boletos ={
                titulo: req.body.titulo,
                vencimento: req.body.vencimento,
                usuario: req.body.usuario,
                status: req.body.status,
                boletoAr: file.path,
            }

            const response = await BoletoModel.create(boletos)

            res.status(201).json({ response, msg: "Boleto cadastrado com sucesso!" })
        } catch (error) {
            console.log(`Deu erro em: ${error}`)
            res.status(400).send("Erro ao criar boleto")
        }
    },

    update: async (req, res) => {
        try {
            const id = req.params.id;

            let boleto = {
                titulo: req.body.titulo,
                vencimento: req.body.vencimento,
                usuario: req.body.usuario,
                status: req.body.status
            };

            // Verifica se há um novo arquivo para ser atualizado
            // if (req.file) {
            //     sistema.documentacaoAr = req.file.path;
            // }

            if (req.file) {
                // Se um novo arquivo foi enviado, exclua o arquivo antigo
                const boletoAntigo = await BoletoModel.findById(id);
                if (boletoAntigo.boletoAr) {
                    fs.unlinkSync(boletoAntigo.boletoAr);
                }
                boleto.boletoAr = req.file.path;
            }

            const updateBoleto = await BoletoModel.findByIdAndUpdate(id, boleto, { new: true });

            if (!updateBoleto) {
                return res.status(404).json({ msg: "Boleto não encontrado" });
            }

            res.status(200).json({ updateBoleto, msg: "Boleto atualizado com sucesso!" });
        } catch (error) {
            console.error(`Erro ao atualizar o boleto: ${error}`);
            res.status(400).send("Erro ao atualizar boleto");
        }
    },

    downloadFile: async (req, res) => {
        try {
            const id = req.params.id;
            const boleto = await BoletoModel.findById(id);
    
            if (!boleto || !boleto.boletoAr) {
                return res.status(404).json({ msg: "Arquivo não encontrado!" });
            }
    
            const filePath = path.resolve(boleto.boletoAr);
            res.download(filePath);
        } catch (error) {
            console.log(`Erro ao baixar arquivo: ${error}`);
            res.status(400).send("Erro ao baixar arquivo");
        }
    },

    delete: async (req, res) => {
        try {
            const id = req.params.id;
            const boleto = await BoletoModel.findById(id);
    
            if (!boleto) {
                return res.status(404).json({ msg: "Boleto não encontrado" });
            }
    
            // Excluir arquivo se existir
            if (boleto.boletoAr) {
                const filePath = path.resolve(boleto.boletoAr);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(`Erro ao deletar arquivo: ${err}`);
                    }
                });
            }
    
            const deleteBoleto = await BoletoModel.findByIdAndDelete(id);
            res.status(200).json({ deleteBoleto, msg: "Boleto deletado com sucesso!" });
        } catch (error) {
            console.log(`Erro ao deletar boleto: ${error}`);
            res.status(400).send("Erro ao deletar boleto");
        }
    }
    
}

module.exports = BoletoController