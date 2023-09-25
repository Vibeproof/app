import { createStyles, Header as HeaderMantine, Menu, Text, Group, Center, Burger, Container, rem, Button, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import { MantineLogo } from '@mantine/ds';
import { ConnectKitButton } from 'connectkit';
import { Link } from 'react-router-dom';
import Logo from './Logo';


const HEADER_HEIGHT = rem(60);


const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background,
    borderBottom: 0,
  },
  inner: {
    height: rem(HEADER_HEIGHT),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background!,
        0.1
      ),
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },
}));

interface HeaderSearchProps {
  links: { 
    link: string;
    label: string;
  }[];
}

export default function Header({ links }: HeaderSearchProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes } = useStyles();

  const items = links.map((link) => {
    return (
      <Link
        key={link.label}
        to={link.link}
        className={classes.link}
      >
        {link.label}
      </Link>
    );
  });

  return (
    <HeaderMantine height={HEADER_HEIGHT} className={classes.header} mb={20}>
      <Container className={classes.inner}>
        <Group>
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
            color="#fff"
          />

          <Logo />
        </Group>

        <Group>
        </Group>

        <Group spacing={5} className={classes.links}>
          {items}
        </Group>

        {/* <Button radius="xl" h={30}>
          Get early access
        </Button> */}
        <ConnectKitButton showAvatar={true} theme='soft' />
      </Container>
    </HeaderMantine>
  );
}