import Head from "next/head";
import { Form, Button, Card, Spinner, Modal, Tabs, Tab, Table, Col, Row } from "react-bootstrap";
import Web3 from "web3";
import { useWallet } from "use-wallet";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import {request, gql} from 'graphql-request';

const GET_MINTERS = gql`
  query getMinters {
    minters (first: 1000, orderBy: count, orderDirection: desc) {
      id
      count
    }
  }
`

const GET_HISTORIES = gql`
query getHistories {
  histories (first: 1000) {
    id
    minter
    status
  }
}
`

const abi = [
	{
		"inputs": [
			{
				"internalType": "uint64",
				"name": "subscriptionId",
				"type": "uint64"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "have",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "want",
				"type": "address"
			}
		],
		"name": "OnlyCoordinatorCanFulfill",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "minter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "MINT_FAILED",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "MINT_PENDING",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "minter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "MINT_SUCCESS",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "randomWords",
				"type": "uint256[]"
			}
		],
		"name": "rawFulfillRandomWords",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "requestRandomWords",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeBatchTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			}
		],
		"name": "TransferBatch",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "TransferSingle",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "value",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "URI",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "withdrawMatic",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "accounts",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			}
		],
		"name": "balanceOfBatch",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "history",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "enum RandomMint.Status",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "s_randomWords",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "uri",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0x195a19883d39E1cD24269BA3e9a711855bd0c471";

export default function Home() {
  const [percent, setPercent] = useState(0);
  const [show, setShow] = useState(false);
  const [minters, setMinters] = useState([]);
  const [history, setHistory] = useState([]);
  const [mintStatus, setMintStatus] = useState(false);
  const [buttonText, setButtonText] = useState("Mint");
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();

  const onMint = async () => {
    if (wallet.connect) {
      const web3 = new Web3(wallet.ethereum);
      const contract = new web3.eth.Contract(abi, contractAddress);
      const value = web3.utils.toWei(`${(percent / 100).toFixed(2)}`, "ether");

      setLoading(true);
      setButtonText("Processing minting...");
      const res = await contract.methods.requestRandomWords().send({
        value,
        from: wallet.account,
      });
      const interval = setInterval(async () => {
        const mint = await contract.methods
          .history(res.events.MINT_PENDING.returnValues.requestId)
          .call();

        if (mint[2] === "2") {
          clearInterval(interval);
          setLoading(false);
          setButtonText("Proceed");
          setMintStatus(true);
          setShow(true);
        } else if (mint[2] === "1") {
          clearInterval(interval);
          setLoading(false);
          setButtonText("Proceed");
          setMintStatus(false);
          setShow(true);
        }
      }, 5000);
    }
  };

  const handleClose = () => setShow(false);

  const fetchHistory = async () => {
    const { minters } = await request('https://api.thegraph.com/subgraphs/name/jupiteruwdev/random-mint', GET_MINTERS)
    const { histories } = await request('https://api.thegraph.com/subgraphs/name/jupiteruwdev/random-mint', GET_HISTORIES);
    setMinters(minters);
    setHistory(histories);
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Random Mint</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Modal show={show} onHide={handleClose} animation={false}>
          <Modal.Header closeButton>
            <Modal.Title>Mint Result</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {mintStatus ? "Successfully minted!" : "Mint Failed!"}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>
              Okay
            </Button>
          </Modal.Footer>
        </Modal>
        <Card className="p-3" style={{ width: "800px", height: '60vh' }}>
          <Tabs>
            <Tab eventKey="mint" title="Mint">
              <div style={{padding: '1rem'}}>
              {wallet?.status === "connected" ? (
                <Form>
                  <Row className="mb-3">
                    <Form.Group as={Col} className="mb-3" controlId="formBasicEmail">
                      <Form.Label>Random Percentage</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Random Percentage"
                        min={5}
                        max={100}
                        value={percent}
                        onChange={(e) => setPercent(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="formBasicEmail">
                      <Form.Label>Amount Payment (Matic)</Form.Label>
                      <Form.Control
                        type="number"
                        readOnly
                        placeholder="Sending Amount"
                        value={percent / 100}
                      />
                    </Form.Group>
                  </Row>

                  <Form.Group className="mb-3">
                    <Button
                      variant="primary"
                      disabled={loading}
                      className="btn btn-default w-100 d-flex align-items-center justify-content-center"
                      onClick={onMint}
                    >
                      {loading && <Spinner animation="border" size="sm" />}
                      <span style={{ paddingLeft: "5px" }}>{buttonText}</span>
                    </Button>
                  </Form.Group>
                </Form>
              ) : (
                <Button variant="primary" onClick={() => wallet.connect()}>
                  Connect Wallet
                </Button>
              )}
              </div>
            </Tab>
            <Tab eventKey="holders" title="Holders">
              <div style={{padding: '1rem'}}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Wallet</th>
                      <th>Number of NFTs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {minters.map((minter, index) => (
                      <tr key={minter.id}>
                        <td>{index + 1}</td>
                        <td>{minter.id}</td>
                        <td>{minter.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
            <Tab eventKey="history" title="History">
            <div style={{padding: '1rem'}}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Wallet</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.minter}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>
          
        </Card>
      </main>
    </div>
  );
}
