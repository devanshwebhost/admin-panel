import GroqChat from "@/components/GroqChat";
import MobileNavbar from "@/components/MobileNavbar";

export default function Pascel({user}) {
  return <div>
    <MobileNavbar title="Pascel AI"/>
    <GroqChat user={user}/>
  </div>;
}
