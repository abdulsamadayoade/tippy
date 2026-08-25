type LegalSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

type LegalPageProps = {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
  crossLinks: { label: string; href: string }[];
};

export type { LegalSection, LegalPageProps };
