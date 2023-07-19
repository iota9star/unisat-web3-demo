import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Button, Card, Input, Radio } from "antd";

function App() {
  const [unisatInstalled, setUnisatInstalled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [network, setNetwork] = useState("livenet");

  const getBasicInfo = async () => {
    const unisat = (window as any).unisat;
    const [address] = await unisat.getAccounts();
    setAddress(address);

    const publicKey = await unisat.getPublicKey();
    setPublicKey(publicKey);

    const balance = await unisat.getBalance();
    setBalance(balance);

    const network = await unisat.getNetwork();
    setNetwork(network);
  };

  const selfRef = useRef<{ accounts: string[] }>({
    accounts: [],
  });
  const self = selfRef.current;
  const handleAccountsChanged = (_accounts: string[]) => {
    if (self.accounts[0] === _accounts[0]) {
      // prevent from triggering twice
      return;
    }
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setAccounts(_accounts);
      setConnected(true);

      setAddress(_accounts[0]);

      getBasicInfo();
    } else {
      setConnected(false);
    }
  };

  const handleNetworkChanged = (network: string) => {
    debugger;
    setNetwork(network);
    getBasicInfo();
  };

  useEffect(() => {
    async function checkUnisat() {
      let unisat = (window as any).unisat;

      for (let i = 1; i < 10 && !unisat; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100 * i));
        unisat = (window as any).unisat;
      }

      if (unisat) {
        setUnisatInstalled(true);
      } else if (!unisat) return;

      unisat.getAccounts().then((accounts: string[]) => {
        handleAccountsChanged(accounts);
      });

      unisat.on("accountsChanged", handleAccountsChanged);
      unisat.on("networkChanged", handleNetworkChanged);

      return () => {
        unisat.removeListener("accountsChanged", handleAccountsChanged);
        unisat.removeListener("networkChanged", handleNetworkChanged);
      };
    }

    checkUnisat().then();
  }, []);

  if (!unisatInstalled) {
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <Button
              onClick={() => {
                window.location.href = "https://unisat.io";
              }}
            >
              Install Unisat Wallet
            </Button>
          </div>
        </header>
      </div>
    );
  }
  const unisat = (window as any).unisat;
  return (
    <div className="App">
      <header className="App-header">
        <p>Unisat Wallet Demo</p>

        {connected ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Card
              size="small"
              title="Basic Info"
              style={{ width: 300, margin: 10 }}
            >
              <div style={{ textAlign: "left", marginTop: 10 }}>
                <div style={{ fontWeight: "bold" }}>Address:</div>
                <div style={{ wordWrap: "break-word" }}>{address}</div>
              </div>

              <div style={{ textAlign: "left", marginTop: 10 }}>
                <div style={{ fontWeight: "bold" }}>PublicKey:</div>
                <div style={{ wordWrap: "break-word" }}>{publicKey}</div>
              </div>

              <div style={{ textAlign: "left", marginTop: 10 }}>
                <div style={{ fontWeight: "bold" }}>Balance: (Satoshis)</div>
                <div style={{ wordWrap: "break-word" }}>{balance.total}</div>
              </div>
            </Card>

            <Card
              size="small"
              title="Switch Network"
              style={{ width: 300, margin: 10 }}
            >
              <div style={{ textAlign: "left", marginTop: 10 }}>
                <div style={{ fontWeight: "bold" }}>Network:</div>
                <Radio.Group
                  onChange={async (e) => {
                    const network = await unisat.switchNetwork(e.target.value);
                    setNetwork(network);
                  }}
                  value={network}
                >
                  <Radio value={"livenet"}>livenet</Radio>
                  <Radio value={"testnet"}>testnet</Radio>
                </Radio.Group>
              </div>
            </Card>

            <SignPsbtCard />
            <SignPsbtsCard />
            <SignMessageCard />
            <PushTxCard />
            <PushPsbtCard />
            <SendBitcoin />
            <SendInscription />
          </div>
        ) : (
          <div>
            <Button
              onClick={async () => {
                const result = await unisat.requestAccounts();
                handleAccountsChanged(result);
              }}
            >
              Connect Unisat Wallet
            </Button>
          </div>
        )}
      </header>
    </div>
  );
}

function SignPsbtCard() {
  const [psbtHex, setPsbtHex] = useState("70736274ff0100fdcf0102000000044ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50500000000ffffffff4ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50300000000ffffffff8ccc640407fcefd74d3e37f8ffb64f42cc98ae0ed6143baa1fab2f05c621727e0100000000ffffffff4ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50a00000000ffffffff07b00400000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89102700000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890b4a000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb4402000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc365580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be899bdc05000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be8900000000000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89000100fdcf010200000004d8d55c7d29054e1fbbeac8afa01fc34d0dad76e3d1fb2a1d0af2625a6359fdf00400000000ffffffffd8d55c7d29054e1fbbeac8afa01fc34d0dad76e3d1fb2a1d0af2625a6359fdf00200000000ffffffffca19b80f7e12f8fdb98e4ea9a76e1228241abf216bf5f9f2afdf450cf90bf10a0000000000ffffffffbf96449857e7480ed86e5d35194ac82f31ccdd728902471342f037d3e37e81ff0600000000ffffffff07b004000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb1027000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb60a50000000000002251204064e07f8fbf97c76acb6effb3259fa0635f6818768c40840748557410825ec11a04000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc3655802000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb5802000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bba409050000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb0000000001012b1027000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012bca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890000000000000000");
  const [psbtResult, setPsbtResult] = useState("");
  return (
    <Card size="small" title="Sign Psbt" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>PsbtHex:</div>
        <Input
          defaultValue={psbtHex}
          onChange={(e) => {
            setPsbtHex(e.target.value);
          }}
        ></Input>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Result:</div>
        <div style={{ wordWrap: "break-word" }}>{psbtResult}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            const psbtResult = await (window as any).unisat.signPsbt(psbtHex);
            setPsbtResult(psbtResult);
          } catch (e) {
            setPsbtResult((e as any).message);
          }
        }}
      >
        Sign Psbt
      </Button>
    </Card>
  );
}


function SignPsbtsCard() {
  const [psbtHex, setPsbtHex] = useState("70736274ff0100fdc40102000000044ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50100000000ffffffff4ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50200000000ffffffff43a9de7013ba981c8a40a5bfeba532bd5121f00b5a1d76734d35154e6dfa26040000000000ffffffff00f4fa6a7c40cedab5b1947c1337263826135af4aadb073f2c0c4bb4e5aea2250600000000ffffffff07b00400000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89102700000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be896f3c00000000000017a914a67da3384ea9ba1fb73f4e91b0ddc8b01cdb727d874402000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc365580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89900505000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be8900000000000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89000100fd870202000000000101f05d04af75bb180c5f8f1c02741cfb6bf9e625494fab7cc3fe287617e9583ff30000000000fdffffff022202000000000000225120af6f9b4c0d70cf9c40dbd2cd8b6a36046eaec8bb18a6b0ce93ade1f5cb20d0360e0f0000000000001600142d6340f5b7a7e795fac6efa465ed35b350e7b75f03407d9022ed9f4fe7af29ba90395bf7a1b9492ce635ad53a1d9f6ffced63a246a74bf3aef43aea06cbac0e5821e2c9f5d5681134f929c0ceea4a48634da64fdb5d1fda10120117f692257b2331233b5705ce9c682be8719ff1b2b64cbca290bd6faeb54423eac065de54a348801750063036f7264010109696d6167652f706e67004d600189504e470d0a1a0a0000000d49484452000000240000002408020000006e620fcf0000000467414d410000b18f0bfc6105000000017352474200aece1ce9000000097048597300000ec300000ec301c76fa864000000f54944415448c7ed95310ec2300c45ff09186043822b30c14198992bae000b1b2b57e09a6c58fa92f59bb6895b2126475f95f39bfad589aba2bb7ffe26242c61094b58c216c300349ddfc02cefe174447f14ce6f60cc6bdaee770c5cea44780892347b4175b3c96bc32c8b8a790b27581c9a655d9f37eadc5d4ca38e23eb3c04373022ee64858729928dd7e31d975756a90f9546b714880de7f18ca77818257143fcad9b5572815736d59ca81c15e362a386d205c5e3d1cafced7caa45bba35fde701a3a33fd8c74ca58afa3cbdc99d18d7c7eb5de682f286ce86b3ca31b8da15722f52c19f056b17e46eb6b65cb46fea91396b09ebe1afeaeb4ce1a6b390000000049454e44ae4260826821c0117f692257b2331233b5705ce9c682be8719ff1b2b64cbca290bd6faeb54423e0000000001012b2202000000000000225120af6f9b4c0d70cf9c40dbd2cd8b6a36046eaec8bb18a6b0ce93ade1f5cb20d036011720c4b17af6d4a109c58ef5059640e4fb8570240999d22b862d949acce35c0b1ed7000100fdda02020000000001044ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50700000000ffffffff75efb479539f86981fc6e8d331addfede4fce157c86dd926ce0fecb08f6592f70400000000ffffffff30c9d7d15bea9f4de874b9a7bc831fce638c232a3f94668feb292d5892b5f4e90000000000ffffffff75efb479539f86981fc6e8d331addfede4fce157c86dd926ce0fecb08f6592f70600000000ffffffff07b00400000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89102700000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89e32c0000000000002251204e75f1367d26dd7df1101932b17c0408e31cef84527392654f1a0b6d0e67ee6c4402000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc365580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89298005000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89014058376fa051a42dd2add9861560b6d0a5ed59471520f47984a31655a3eb1f5f0e9dbb2aaba4002fa72a1a659537d2bbde3ebc655e539d98fc91ff498d5264decb0140ac005bb331c20618085bfcf28f121bfd6f3ad1bd1ef5d2d6cbd08ed1945440779e55e37698a212b1a73193cb44b47b0a3ca8ca863f36c19593dc8bd1d4c8cb570141e3329c0505aa7fece538ac3f7527032807ff2912216638aa0fd630fba7925c87b0d288114d5aeae89dd60079b58284b47569fbc15afe76ad132b171c8eacac1983014091699cd4073cb7c6a2338f10ac5bde7012647791f49cdc7ca43ff20c4b542fbc7b1e2df72cb278b93eb7c75ddce3da764bc225148da1904037115adc9bd9ef450000000001012b298005000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890000000000000000,70736274ff0100fdcf0102000000044ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50500000000ffffffff4ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50300000000ffffffff8ccc640407fcefd74d3e37f8ffb64f42cc98ae0ed6143baa1fab2f05c621727e0100000000ffffffff4ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50a00000000ffffffff07b00400000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89102700000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890b4a000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb4402000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc365580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be899bdc05000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be8900000000000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89000100fdcf010200000004d8d55c7d29054e1fbbeac8afa01fc34d0dad76e3d1fb2a1d0af2625a6359fdf00400000000ffffffffd8d55c7d29054e1fbbeac8afa01fc34d0dad76e3d1fb2a1d0af2625a6359fdf00200000000ffffffffca19b80f7e12f8fdb98e4ea9a76e1228241abf216bf5f9f2afdf450cf90bf10a0000000000ffffffffbf96449857e7480ed86e5d35194ac82f31ccdd728902471342f037d3e37e81ff0600000000ffffffff07b004000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb1027000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb60a50000000000002251204064e07f8fbf97c76acb6effb3259fa0635f6818768c40840748557410825ec11a04000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc3655802000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb5802000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bba409050000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb0000000001012b1027000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012bca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890000000000000000");
  const [psbtResult, setPsbtResult] = useState("");
  return (
    <Card size="small" title="Sign Psbts" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>PsbtHexs:</div>
        <Input
          defaultValue={psbtHex}
          onChange={(e) => {
            setPsbtHex(e.target.value);
          }}
        ></Input>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Result:</div>
        <div style={{ wordWrap: "break-word" }}>{psbtResult}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            const psbtResult = await (window as any).unisat.signPsbts(psbtHex.split(","));
            setPsbtResult(psbtResult);
          } catch (e) {
            setPsbtResult((e as any).message);
          }
        }}
      >
        Sign Psbts
      </Button>
    </Card>
  );
}

function SignMessageCard() {
  const [message, setMessage] = useState("hello world~");
  const [signature, setSignature] = useState("");
  return (
    <Card size="small" title="Sign Message" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Message:</div>
        <Input
          defaultValue={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        ></Input>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Signature:</div>
        <div style={{ wordWrap: "break-word" }}>{signature}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          const signature = await (window as any).unisat.signMessage(message);
          setSignature(signature);
        }}
      >
        Sign Message
      </Button>
    </Card>
  );
}

function PushTxCard() {
  const [rawtx, setRawtx] = useState("");
  const [txid, setTxid] = useState("");
  return (
    <Card
      size="small"
      title="Push Transaction Hex"
      style={{ width: 300, margin: 10 }}
    >
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>rawtx:</div>
        <Input
          defaultValue={rawtx}
          onChange={(e) => {
            setRawtx(e.target.value);
          }}
        ></Input>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>txid:</div>
        <div style={{ wordWrap: "break-word" }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            const txid = await (window as any).unisat.pushTx(rawtx);
            setTxid(txid);
          } catch (e) {
            setTxid((e as any).message);
          }
        }}
      >
        PushTx
      </Button>
    </Card>
  );
}

function PushPsbtCard() {
  const [psbtHex, setPsbtHex] = useState("70736274ff0100fdcf0102000000044ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50500000000ffffffff4ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50300000000ffffffff8ccc640407fcefd74d3e37f8ffb64f42cc98ae0ed6143baa1fab2f05c621727e0100000000ffffffff4ce6cfae9d6488d5c44d309b50fd237199469891b16c47b679ba347b2552e2f50a00000000ffffffff07b00400000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89102700000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890b4a000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb4402000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc365580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be899bdc05000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be8900000000000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89000100fdcf010200000004d8d55c7d29054e1fbbeac8afa01fc34d0dad76e3d1fb2a1d0af2625a6359fdf00400000000ffffffffd8d55c7d29054e1fbbeac8afa01fc34d0dad76e3d1fb2a1d0af2625a6359fdf00200000000ffffffffca19b80f7e12f8fdb98e4ea9a76e1228241abf216bf5f9f2afdf450cf90bf10a0000000000ffffffffbf96449857e7480ed86e5d35194ac82f31ccdd728902471342f037d3e37e81ff0600000000ffffffff07b004000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb1027000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb60a50000000000002251204064e07f8fbf97c76acb6effb3259fa0635f6818768c40840748557410825ec11a04000000000000160014c015c65276d5f38d599d445c4cb03aa7aa0dc3655802000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb5802000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bba409050000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb0000000001012b1027000000000000225120292b9b99804dfabd6bc3be7e6fae19cde9271745fd12f12dc68e51a41cceb3bb000100fd5002020000000001014c67403627b567251f9da1996a2f1dade5381b0be50908932fc7e0a65e3729200100000000ffffffff0b580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89580200000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be89ca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890140887de9f4b3e630e49c731d7108b36202ce95b28428bea41489b0de824cffcb8752ad8f5aa8963c5bc9c07029545c0a2535689ae95cc2a73e3bd97692f41736540000000001012bca4e06000000000022512061f023b192540b40b459e9aa62aedceb874e6ea599723d21aa7274e5ddc3be890000000000000000");
  const [txid, setTxid] = useState("");
  return (
    <Card size="small" title="Push Psbt Hex" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>psbt hex:</div>
        <Input
          defaultValue={psbtHex}
          onChange={(e) => {
            setPsbtHex(e.target.value);
          }}
        ></Input>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>txid:</div>
        <div style={{ wordWrap: "break-word" }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            const txid = await (window as any).unisat.pushPsbt(psbtHex);
            setTxid(txid);
          } catch (e) {
            setTxid((e as any).message);
          }
        }}
      >
        pushPsbt
      </Button>
    </Card>
  );
}

function SendBitcoin() {
  const [toAddress, setToAddress] = useState(
    "bc1pv8cz8vvj2s95pdzeax4x9tkuawr5um49n9er6gd2wf6wthwrh6yshmqh62"
  );
  const [satoshis, setSatoshis] = useState(1000);
  const [feeRate, setFeeRate] = useState('');
  const [txid, setTxid] = useState("");
  return (
    <Card size="small" title="Send Bitcoin" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Receiver Address:</div>
        <Input
          defaultValue={toAddress}
          onChange={(e) => {
            setToAddress(e.target.value);
          }}
        ></Input>
      </div>

      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Amount: (satoshis)</div>
        <Input
          defaultValue={satoshis}
          onChange={(e) => {
            setSatoshis(parseInt(e.target.value));
          }}
        ></Input>
      </div>

      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>FeeRate: </div>
        <Input
          defaultValue={feeRate}
          onChange={(e) => {
            setFeeRate(e.target.value);
          }}
        ></Input>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>txid:</div>
        <div style={{ wordWrap: "break-word" }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            const txid = await (window as any).unisat.sendBitcoin(
              toAddress,
              satoshis,
              feeRate ? { feeRate } : undefined
            );
            setTxid(txid);
          } catch (e) {
            setTxid((e as any).message);
          }
        }}
      >
        SendBitcoin
      </Button>
    </Card>
  );
}

function SendInscription() {
  const [toAddress, setToAddress] = useState(
    "bc1pv8cz8vvj2s95pdzeax4x9tkuawr5um49n9er6gd2wf6wthwrh6yshmqh62"
  );
  const [insId, setInsId] = useState("3b0531f7aeee189c04ce25d06daed901bf4e5edb26c9a57f782657759375e27di0");
  const [feeRate, setFeeRate] = useState('');
  const [txid, setTxid] = useState("");
  return (
    <Card
      size="small"
      title="Send Inscription"
      style={{ width: 300, margin: 10 }}
    >
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Receiver Address:</div>
        <Input
          defaultValue={toAddress}
          onChange={(e) => {
            setToAddress(e.target.value);
          }}
        ></Input>
      </div>

      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>Inscription ID: </div>
        <Input
          defaultValue={insId}
          onChange={(e) => {
            setInsId(e.target.value);
          }}
        ></Input>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>FeeRate: </div>
        <Input
          defaultValue={feeRate}
          onChange={(e) => {
            setFeeRate(e.target.value);
          }}
        ></Input>
      </div>
      <div style={{ textAlign: "left", marginTop: 10 }}>
        <div style={{ fontWeight: "bold" }}>txid:</div>
        <div style={{ wordWrap: "break-word" }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            const txid = await (window as any).unisat.sendInscription(
              toAddress,
              insId,
              feeRate ? { feeRate } : undefined,
            );
            setTxid(txid);
          } catch (e) {
            setTxid((e as any).message);
          }
        }}
      >
        SendInscription
      </Button>
    </Card>
  );
}

export default App;
