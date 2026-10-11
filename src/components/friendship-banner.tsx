/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
export function FriendshipBanner({ photo }: { photo: string }) {
  return (
    <section
      className="friendship-banner container"
      aria-label="Presentes para quem importa"
    >
      <div className="friendship-copy">
        <p className="eyebrow">UM PRESENTE. MUITAS HISTÓRIAS.</p>
        <h2>
          Os melhores presentes
          <br />
          <em>
            começam com
            <br />
            quem importa.
          </em>
        </h2>
        <p>
          Para quem divide as risadas, os planos e os dias comuns. Um carinho
          para dizer: que bom ter você por perto.
        </p>
        <Link className="button" href="/catalogo?ocasiao=Agradecimento">
          Presentear quem faz parte <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="friendship-photo">
        <img
          src={photo}
          alt="Quatro amigos sorrindo juntos em uma selfie"
          loading="lazy"
          width={1024}
          height={647}
        />
      </div>
    </section>
  );
}
