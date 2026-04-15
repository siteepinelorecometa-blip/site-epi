import fundoFicha from "../assets/ficha/fundo-ficha.png";
import logoPrevencaoCometa from "../assets/ficha/logo-prevencao-cometa.png";
import logoCipa from "../assets/ficha/logo-cipa.png";
import { CONFIG_FICHA_FAZENDA } from "../data/fichaFazendas";
import "./FichaEPIModelo.css";

type LinhaFicha = {
  dataEntrega: string;
  quantidade: number | string;
  descricao: string;
  ca: string;
  assinatura?: string;
  motivoTroca?: string;
  devolucaoData?: string;
};

type Props = {
  nome: string;
  funcao: string;
  fazendaSistema: string;
  cpf?: string;
  linhas: LinhaFicha[];
};

export default function FichaEPIModelo({
  nome,
  funcao,
  fazendaSistema,
  cpf = "",
  linhas,
}: Props) {
  const hoje = new Date();

  const dia = String(hoje.getDate()).padStart(2, "0");
  const ano = hoje.getFullYear();

  const meses = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];

  const mes = meses[hoje.getMonth()];

  const configFazenda =
    CONFIG_FICHA_FAZENDA.find((f) => f.nomeSistema === fazendaSistema) ||
    CONFIG_FICHA_FAZENDA.find((f) => f.sigla === fazendaSistema);

  const ehEscritorio = fazendaSistema === "ESC";

  const nomeEmpresa = ehEscritorio
    ? "COMETA DO PANTANAL"
    : configFazenda?.nomeFicha || "FRANCIS MARIS CRUZ";

  const cidadeEmpresa = ehEscritorio
    ? "Cáceres - MT"
    : configFazenda?.cidade || "";

  const linhasVisiveis = [...linhas];

  while (linhasVisiveis.length < 30) {
    linhasVisiveis.push({
      dataEntrega: "",
      quantidade: "",
      descricao: "",
      ca: "",
      assinatura: "",
      motivoTroca: "",
      devolucaoData: "",
    });
  }

  return (
    <div className="ficha-duas-paginas">
      <div className="ficha-pagina pagina-1">
        <img src={fundoFicha} alt="" className="ficha-bg" />
        <img src={logoPrevencaoCometa} alt="" className="ficha-logo-esquerda" />
        <img src={logoCipa} alt="" className="ficha-logo-direita" />

        <div className="ficha-titulo">
          <div>FICHA DE E.P.I´s.</div>
          <div>(EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL)</div>
        </div>

        <div className="ficha-box nome-box">
          <strong>NOME:</strong> {nome}
        </div>

        <div className="ficha-box funcao-box">
          <strong>FUNÇÃO:</strong> {funcao}
        </div>

        <div className="ficha-texto-principal">
          <p>
            A empresa <strong>{nomeEmpresa}</strong>,
            CPF n° 103.605.221-49, a título de empréstimo para uso individual,
            exclusivo e obrigatório nas dependências da empresa, conforme
            determinado na NR-06, 6.3 – 6.6.1 da Portaria 3.214/78 está
            fornecendo os equipamentos especificados neste Termo de
            Responsabilidade.
          </p>

          <p className="paragrafo-central">
            Declaro para fins de direito que recebi, nesta data, os Equipamentos
            de Proteção Individual, abaixo relacionados, fornecidos gratuitamente
            pela empresa e destinados exclusivamente à proteção contra acidentes
            e/ou doenças, nos termos do Art. 166 do c/c Art.191 da CLT e NR-6 da
            Portaria do Ministério do Trabalho nº 3.214/78, bem como em
            conformidade com o PGR, PCMSO e LTCAT.
          </p>

          <p>
            Declaro também estar ciente e comprometo-me a cumprir as
            determinações estabelecidas pela empresa, conforme segue:
          </p>

          <p>
            a) Recebi treinamento da necessidade da utilização dos referidos
            EPI&apos;s, a maneira correta de usá-los, guardá-los e higienizá-los,
            bem como da responsabilidade de uso conforme determinado na NR-1 da
            Portaria do Ministério do Trabalho nº 3.214/78.
          </p>

          <p>
            b) Caso o Equipamento seja danificado, utilizado com negligência, de
            forma inadequada, extraviado ou torne-se inutilizável, a empresa
            fornecerá novo Equipamento e cobrará valor referente ao prejuízo,
            conforme dispõe § 1º do artigo 462 da CLT.
          </p>

          <p>
            c) Em caso de dano, inutilização ou extravio do Equipamento deve ser
            comunicado, imediatamente, o setor de recursos humanos.
          </p>

          <p>
            d) Não estou autorizado a fornecer ou emprestar o Equipamento que
            estiver sob minha responsabilidade, só podendo fazê-lo se receber
            ordem por escrito do meu superior imediato.
          </p>

          <p>
            e) Estando os Equipamentos em minha posse, estarei sujeito a
            inspeções sem prévio aviso.
          </p>

          <p>
            f) No caso de rescisão do contrato de trabalho, devolverei o
            Equipamento completo e em perfeito estado de conservação,
            considerando-se o tempo do uso do mesmo, ao setor de recursos
            humanos.
          </p>

          <p>
            g) Fico ciente que a não utilização do Equipamento de Proteção
            Individual durante a execução das funções laborais se sujeita às
            sanções disciplinares cabíveis como simples advertências até a
            dispensa por justa causa nos termos do artigo 482, h da CLT c/c a
            NR-1 e NR-6 da Portaria do Ministério do Trabalho nº 3.214/78.
          </p>
        </div>

        <div className="ficha-cidade-data">
          {cidadeEmpresa}, {dia} DE {mes} DE {ano}.
        </div>

        <div className="ficha-ciente-box">
          <span className="ciente-label">CIENTE</span>
          <span className="ciente-linha" />
          <span className="cpf-label">CPF:</span>
          <span className="cpf-valor">{cpf}</span>
        </div>
      </div>

      <div className="ficha-pagina pagina-2">
        <img src={fundoFicha} alt="" className="ficha-bg" />
        <img src={logoPrevencaoCometa} alt="" className="ficha-logo-esquerda" />
        <img src={logoCipa} alt="" className="ficha-logo-direita" />

        <div className="ficha-subtitulo-epi">
          EPI
          <br />
          (EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL)
        </div>

        <table className="ficha-tabela">
          <thead>
            <tr>
              <th>Entrega (data)</th>
              <th>Quantidade</th>
              <th>Identificação / descrição</th>
              <th>N° do C.A</th>
              <th>Assinatura (colaborador)</th>
              <th>Motivo da Troca</th>
              <th>Devolução (data)</th>
            </tr>
          </thead>
          <tbody>
            {linhasVisiveis.map((linha, index) => (
              <tr key={index}>
                <td>{linha.dataEntrega}</td>
                <td>{linha.quantidade}</td>
                <td>{linha.descricao || (linha as any).epiNome}</td>
                <td>{linha.ca}</td>
                <td>{linha.assinatura}</td>
                <td>{linha.motivoTroca}</td>
                <td>{linha.devolucaoData}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ficha-legenda">
          Legenda: Motivo da troca: A: Admissão &nbsp; D: Danificados por uso
          normal &nbsp; P: Perda &nbsp; AQ: Aquisição &nbsp; NA: Não se aplica
        </div>

        <div className="ficha-assinaturas-linhas">
          <div className="linha-assinatura" />
          <div className="linha-assinatura" />
        </div>

        <div className="ficha-assinaturas">
          <div>ASS. PRESIDENTE OU DESIGNADO DA CIPA</div>
          <div>GERENTE</div>
        </div>
      </div>
    </div>
  );
}
