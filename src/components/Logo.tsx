import React from "react";
import { createStyles } from "@mantine/core";
import { Link } from "react-router-dom";
import logo from './../assets/logo.svg';


const useStyles = createStyles((theme) => ({
    logo: {
      color: theme.white,
      fontSize: theme.fontSizes.lg,
      fontWeight: 600,
      textDecoration: 'none',
    },
}));


export default function Logo() {
    const { classes } = useStyles();

    return (
        <Link to={'/'} className={classes.logo}>
            <img src={logo} width={60}></img>

            Vibeproof
        </Link>
    );
}